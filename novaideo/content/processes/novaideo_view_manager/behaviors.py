# -*- coding: utf8 -*-
from zope.interface import Interface

from pyramid.httpexceptions import HTTPFound
from substanced.util import find_service, get_oid

from dace.util import getSite
from dace.objectofcollaboration.principal.util import grant_roles, has_any_roles
from dace.processinstance.activity import (
    ElementaryAction,
    LimitedCardinality,
    InfiniteCardinality,
    ActionType,
    StartStep,
    EndStep)
from pontus.view import BasicView
from pontus.schema import select, omit

from novaideo.content.interface import INovaIdeoApplication
from novaideo import _


def seeideas_relation_validation(process, context):
    return True


def seeideas_roles_validation(process, context):
    return has_any_roles(roles=('Member',)) 


def seeideas_processsecurity_validation(process, context):
    return len(context.ideas)>=1


def seeideas_state_validation(process, context):
    return True


class SeeIdeas(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seeideas_relation_validation
    roles_validation = seeideas_roles_validation
    processsecurity_validation = seeideas_processsecurity_validation
    state_validation = seeideas_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def search_relation_validation(process, context):
    return True


def search_roles_validation(process, context):
    return True 


def search_processsecurity_validation(process, context):
    return True


def search_state_validation(process, context):
    return True


class Search(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    actionType = ActionType.automatic
    relation_validation = search_relation_validation
    roles_validation = search_roles_validation
    processsecurity_validation = search_processsecurity_validation
    state_validation = search_state_validation

    def start(self, context, request, appstruct, **kw):
        self.content_types = appstruct['content_types']
        self.text = appstruct['text']
        return True

    def redirect(self, context, request, **kw):
        root = getSite()
        return HTTPFound(request.resource_url(root, "@@search_result", query={'text': self.text, 'content_types': ",".join(self.content_types)}))

#see
def seemy_relation_validation(process, context):
    return True


def seemy_roles_validation(process, context):
    return has_any_roles(roles=('Member',)) 


def seemy_processsecurity_validation(process, context):
    return True


def seemy_state_validation(process, context):
    return True


class SeeMyIdeas(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True


class SeeMyContacts(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

class SeeMyProposals(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

class SeeMySelections(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

class SeeMyParticipations(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

class SeeMySupports(InfiniteCardinality):
    isSequential = False
    context = INovaIdeoApplication
    relation_validation = seemy_relation_validation
    roles_validation = seemy_roles_validation
    processsecurity_validation = seemy_processsecurity_validation
    state_validation = seemy_state_validation

    def start(self, context, request, appstruct, **kw):
        return True

#TODO bihaviors
