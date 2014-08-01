# -*- coding: utf8 -*-
from pyramid.httpexceptions import HTTPFound

from substanced.util import get_oid
from dace.util import find_service, getSite, getBusinessAction 
from dace.objectofcollaboration.principal.util import has_any_roles, grant_roles, get_current
from dace.processinstance.activity import (
    ElementaryAction,
    LimitedCardinality,
    InfiniteCardinality,
    ActionType,
    StartStep,
    EndStep)

from novaideo.ips.mailer import mailer_send
from novaideo.content.interface import INovaIdeoApplication, Iidea
from novaideo import _



def creatidea_relation_validation(process, context):
    return True


def creatidea_roles_validation(process, context):
    return has_any_roles(roles=('Member',)) 


def creatidea_processsecurity_validation(process, context):
    return True


def creatidea_state_validation(process, context):
    return True


class CreatIdea(ElementaryAction):
    context = INovaIdeoApplication
    relation_validation = creatidea_relation_validation
    roles_validation = creatidea_roles_validation
    processsecurity_validation = creatidea_processsecurity_validation
    state_validation = creatidea_state_validation

    def start(self, context, request, appstruct, **kw):
        root = getSite()
        idea = appstruct['_object_data']
        root.addtoproperty('ideas', idea)
        idea.state.append('to work')
        grant_roles(roles=(('Owner', idea), ))
        idea.setproperty('author', get_current())
        self.newcontext = idea
        self.process.execution_context.add_created_entity('idea', idea)
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(self.newcontext, "@@index"))


def duplicat_relation_validation(process, context):
    return True


def duplicat_roles_validation(process, context):
    return has_any_roles(roles=('Member',)) 


def duplicat_processsecurity_validation(process, context):
    return True


def duplicat_state_validation(process, context):
    return True


class DuplicatIdea(ElementaryAction):
    context = Iidea
    relation_validation = duplicat_relation_validation
    roles_validation = duplicat_roles_validation
    processsecurity_validation = duplicat_processsecurity_validation
    state_validation = duplicat_state_validation

    def start(self, context, request, appstruct, **kw):
        #TODO
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def del_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def del_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def del_processsecurity_validation(process, context):
    return True


def del_state_validation(process, context):
    return True


class DelIdea(ElementaryAction):
    context = Iidea
    relation_validation = del_relation_validation
    roles_validation = del_roles_validation
    processsecurity_validation = del_processsecurity_validation
    state_validation = del_state_validation

    def start(self, context, request, appstruct, **kw):
        root  = getSite()
        root.delproperty('ideas', context)
        return True

    def redirect(self, context, request, **kw):
        root = getSite()
        return HTTPFound(request.resource_url(root, "@@index"))


def edit_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def edit_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def edit_processsecurity_validation(process, context):
    return True


def edit_state_validation(process, context):
    return True


class EditIdea(InfiniteCardinality):
    context = Iidea
    relation_validation = edit_relation_validation
    roles_validation = edit_roles_validation
    processsecurity_validation = edit_processsecurity_validation
    state_validation = edit_state_validation

    def start(self, context, request, appstruct, **kw):
        if 'abandoned' in context.state:
            recuperate_actions = getBusinessAction('ideamanagement',
                                                   'recuperate',
                                                   '',
                                                    request,
                                                    context)
            if recuperate_actions:
                recuperate_actions[0].execute(context, request, appstruct, **kw)

        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def pub_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def pub_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def pub_processsecurity_validation(process, context):
    return True


def pub_state_validation(process, context):
    return 'to work' in context.state


class PublishIdea(ElementaryAction):
    context = Iidea
    relation_validation = pub_relation_validation
    roles_validation = pub_roles_validation
    processsecurity_validation = pub_processsecurity_validation
    state_validation = pub_state_validation

    def start(self, context, request, appstruct, **kw):
        context.state.remove('to work')
        context.state.append('published')
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def ab_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def ab_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def ab_processsecurity_validation(process, context):
    return True


def ab_state_validation(process, context):
    return 'to work' in context.state


class AbandonIdea(ElementaryAction):
    context = Iidea
    relation_validation = ab_relation_validation
    roles_validation = ab_roles_validation
    processsecurity_validation = ab_processsecurity_validation
    state_validation = ab_state_validation

    def start(self, context, request, appstruct, **kw):
        context.state.remove('to work')
        context.state.append('abandoned')
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def re_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def re_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def re_processsecurity_validation(process, context):
    return True


def re_state_validation(process, context):
    return 'abandoned' in context.state


class RecuperateIdea(ElementaryAction):
    context = Iidea
    relation_validation = re_relation_validation
    roles_validation = re_roles_validation
    processsecurity_validation = re_processsecurity_validation
    state_validation = re_state_validation

    def start(self, context, request, appstruct, **kw):
        context.state.remove('abandoned')
        context.state.append('to work')
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def comm_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def comm_roles_validation(process, context):
    return has_any_roles(roles=('Member',)) 


def comm_processsecurity_validation(process, context):
    return True


def comm_state_validation(process, context):
    return 'published' in context.state


class CommentIdea(InfiniteCardinality):
    isSequential = False
    context = Iidea
    relation_validation = comm_relation_validation
    roles_validation = comm_roles_validation
    processsecurity_validation = comm_processsecurity_validation
    state_validation = comm_state_validation

    def start(self, context, request, appstruct, **kw):
        comment = appstruct['_object_data']
        context.addtoproperty('comments', comment)
        comment.setproperty('author', comment)
        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


def present_relation_validation(process, context):
    return process.execution_context.has_relation(context, 'idea')


def present_roles_validation(process, context):
    return has_any_roles(roles=(('Owner', context),)) 


def present_processsecurity_validation(process, context):
    return True


def present_state_validation(process, context):
    return 'published' in context.state


presentation_idea_message = u"""
Bonjour {member_title} {member_first_name} {member_last_name},

{user_title} {user_first_name} {user_last_name} souhaite vous présenter l'Idée figurant sur la plateforme Nova-Ideo.org sous {idea_url}. Nova-Ideo est un service en ligne permettant d'initier des propositions, constituer des groupes de travail pour les améliorer et les finaliser, bénéficier de soutiens de membres de la communauté et d'avis de comités d'examen.

Cordialement,

La Plateforme NovaIdeo
"""


class PresentIdea(InfiniteCardinality):
    context = Iidea
    relation_validation = present_relation_validation
    roles_validation = present_roles_validation
    processsecurity_validation = present_processsecurity_validation
    state_validation = present_state_validation

    def start(self, context, request, appstruct, **kw):
        members = appstruct['members']
        exterior_emails = appstruct['exterior_emails']
        user = get_current()
        user_title=getattr(user, 'user_title',''),
        user_first_name=getattr(user, 'first_name', user.name)
        user_last_name=getattr(user, 'last_name','')
        url = request.resource_url(context, "@@index")
        for member in members:
            message = presentation_idea_message.format(
                member_title=getattr(user, 'user_title',''),
                member_first_name=getattr(user, 'first_name', member.name),
                member_last_name=getattr(user, 'last_name',''),
                idea_url=url,
                user_title=user_title,
                user_first_name=user_first_name,
                user_last_name=user_last_name
                 )
            mailer_send(subject='Presentation: '+context.title, recipients=[member.email], body=message)

        for email in exterior_emails:
            message = presentation_idea_message.format(
                member_title='',
                member_first_name='',
                member_last_name='',
                idea_url=url,
                user_title=user_title,
                user_first_name=user_first_name,
                user_last_name=user_last_name
                 )
            mailer_send(subject='Presentation: '+context.title, recipients=[email], body=message)


        return True

    def redirect(self, context, request, **kw):
        return HTTPFound(request.resource_url(context, "@@index"))


#TODO bihaviors
