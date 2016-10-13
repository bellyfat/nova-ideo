import datetime
import pytz
import graphene
from graphene import relay
from graphene.core.classtypes.scalar import Scalar
from graphene.utils import LazyList
from graphql.core.language import ast
from graphql_relay.connection.arrayconnection import cursor_to_offset
import graphene.core.types.custom_scalars
from hypatia.interfaces import STABLE
from pyramid.threadlocal import get_current_request
from substanced.objectmap import find_objectmap

from dace.util import get_obj, find_catalog
from novaideo.views.filter import find_entities
from novaideo.content.interface import Iidea


def get_ideas(args, info):
    try:
        after = cursor_to_offset(args.get('after'))
        first = args.get('first')
        if after is None:
            limit = first
        else:
            limit = after + 1 + first

        limit = limit + 1  # retrieve one more so the hasNextPage works
    except Exception:
        limit = None

    # For the scrolling of the results, it's important that the sort is stable.
    # release_date is set to datetime.datetime.now(tz=pytz.UTC) when the event
    # is published, so we have microsecond resolution and so have a stable sort
    # even with not stable sort algorithms like nbest (because it's unlikely
    # we have several events with the same date).
    # When we specify limit in the query, the sort algorithm chosen will
    # most likely be nbest instead of stable timsort (python sorted).
    # The sort is ascending, meaning we will get new events published during
    # the scroll, it's ok.
    # The only issue we can found here is if x events are removed or unpublished
    # during the scroll, we will skip x new events during the scroll.
    # A naive solution is to implement our own graphql arrayconnection to slice
    # from the last known oid + 1, but the last known oid may not be in the
    # array anymore, so it doesn't work. It's not too bad we skip x events, in
    # reality it should rarely happen.
    rs = find_entities(
        sort_on=None,
        interfaces=[Iidea],
        metadata_filter={'states': ['published']},
    )
    catalog = find_catalog('novaideo')
    release_date_index = catalog['release_date']
    return list(release_date_index.sort(
        list(rs.ids), limit=limit, sort_type=STABLE))


class Date(Scalar):
    '''Date in ISO 8601 format'''

    @staticmethod
    def serialize(date):
        return date.isoformat()

    @staticmethod
    def parse_literal(node):
        if isinstance(node, ast.StringValue):
            return datetime.datetime.strptime(
                node.value, "%Y-%m-%d").date()

    @staticmethod
    def parse_value(value):
        return datetime.datetime.strptime(value, "%Y-%m-%d").date()


class DateTime(Scalar):
    '''DateTime in ISO 8601 format'''

    @staticmethod
    def serialize(dt):
        return dt.isoformat()

    @staticmethod
    def parse_literal(node):
        if isinstance(node, ast.StringValue):
            return datetime.datetime.strptime(
                node.value, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=pytz.UTC)

    @staticmethod
    def parse_value(value):
        return datetime.datetime.strptime(
            value, "%Y-%m-%dT%H:%M:%S.%fZ").replace(tzinfo=pytz.UTC)


class Node(object):

    @classmethod
    def get_node(cls, id, info):
        oid = int(id)
        return cls(_root=get_obj(oid))

    @property
    def id(self):
        return self.__oid__

    def __getattr__(self, name):
        try:
            return super(Node, self).__getattr__(name)
        except Exception:
            log.exception("Error in node %s id:%s attr:%s",
                self.__class__.__name__, self.id, name)
            raise


class Idea(relay.Node, Node):
    title = graphene.String()
    text = graphene.String()
    keywords = graphene.List(graphene.String())


class ResolverLazyList(LazyList):

    def __init__(self, origin, object_type):
        super(ResolverLazyList, self).__init__(origin, state=None)
        objectmap = find_objectmap(get_current_request().root)
        self.resolver = objectmap.object_for
        self.object_type = object_type

    def __next__(self):
        try:
            if not self._origin_iter:
                self._origin_iter = self._origin.__iter__()
            oid = next(self._origin_iter)
            n = self.object_type(_root=self.resolver(oid))
        except StopIteration as e:
            self._finished = True
            raise e
        else:
            self._state.append(n)
            return n

    def __getitem__(self, key):
        item = self._origin[key]
        if isinstance(key, slice):
            return self.__class__(item, object_type=self.object_type)

        return item


class Query(graphene.ObjectType):
    node = relay.NodeField()
    ideas = relay.ConnectionField(
        Idea,
    )

    def resolve_ideas(self, args, info):
        oids = get_ideas(args, info)
        return ResolverLazyList(oids, Idea)


schema = graphene.Schema(query=Query)

if __name__ == '__main__':
    import json
#    import importlib
#    i = importlib.import_module(schema)
#    schema_dict = {'data': i.schema.introspect()}
    schema_dict = {'data': schema.introspect()}
    with open('schema.json', 'w') as outfile:
        json.dump(schema_dict, outfile)