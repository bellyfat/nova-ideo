# Copyright (c) 2014 by Ecreall under licence AGPL terms 
# avalaible on http://www.gnu.org/licenses/agpl.html 

# licence: AGPL
# author: Amen Souissi

import transaction
from pyramid.events import subscriber, ApplicationCreated
from pyramid.threadlocal import get_current_registry, get_current_request
from pyramid.request import Request
from pyramid.threadlocal import manager

from substanced.event import RootAdded
from substanced.util import find_service

from dace.util import getSite

from novaideo.ips.mailer import mailer_send
from novaideo import core
from novaideo.event import (
    ObjectPublished, CorrelableRemoved,
    ObjectModified)
from novaideo.views.filter import (
    get_users_by_keywords, get_users_by_preferences)
from novaideo.content.processes import get_states_mapping
from novaideo import _
from novaideo.content.alert import ContentAlert


_CONTENT_TRANSLATION = [_("The proposal"),
                        _("The idea")]


@subscriber(RootAdded)
def mysubscriber(event):
    """Add the novaideo catalog when the root is added."""
    root = event.object
    registry = get_current_registry()
    settings = registry.settings
    novaideo_title = settings.get('novaideo.title')
    root.title = novaideo_title
    root.init_files()
    catalogs = find_service(root, 'catalogs')
    catalogs.add_catalog('novaideo')


@subscriber(ObjectPublished)
def mysubscriber_object_published(event):
    content = event.object
    keywords = content.keywords
    request = get_current_request()
    users = get_users_by_keywords(keywords)
    url = request.resource_url(content, "@@index")
    root = request.root
    mail_template = root.get_mail_template('alert_new_content')
    subject = mail_template['subject'].format(subject_title=content.title)
    localizer = request.localizer
    author = getattr(content, 'author', None)
    all_users = []
    for member in users:
        all_users.append(member)
        if getattr(member, 'email', '') and author is not member:
            message = mail_template['template'].format(
                recipient_title=localizer.translate(_(getattr(member,
                                                            'user_title', ''))),
                recipient_first_name=getattr(member, 'first_name', member.name),
                recipient_last_name=getattr(member, 'last_name', ''),
                subject_title=content.title,
                subject_url=url,
                subject_type=localizer.translate(
                    _("The " + content.__class__.__name__.lower())),
                novaideo_title=root.title
                 )
            mailer_send(
                subject=subject,
                recipients=[member.email],
                sender=root.get_site_sender(),
                body=message)

    if author in all_users:
        all_users.remove(author)

    alert = ContentAlert(alert_kind='published')
    root.addtoproperty('alerts', alert)
    alert.init_alert(all_users, [content])

    if getattr(content, 'original', None):
        original = content.original
        alert = ContentAlert(
            alert_kind='duplicated',
            url=request.resource_url(original, '@@index'),
            duplicate_title=original.title)
        root.addtoproperty('alerts', alert)
        users = list(get_users_by_preferences(original))
        users.append(original.author)
        alert.init_alert(set(users), [content])


@subscriber(ObjectModified)
def mysubscriber_object_modified(event):
    content = event.object
    args = event.args
    state_source = args.get('state_source', '')
    state_target = args.get('state_target', '')
    request = get_current_request()
    users = get_users_by_preferences(content)
    url = request.resource_url(content, "@@index")
    root = request.root
    mail_template = root.get_mail_template('alert_content_modified')
    subject = mail_template['subject'].format(subject_title=content.title)
    localizer = request.localizer
    all_users = []
    for member in users:
        all_users.append(member)
        if getattr(member, 'email', ''):
            if state_source:
                state_source = localizer.translate(
                    get_states_mapping(
                        member, content, state_source))
            if state_target:
                state_target = localizer.translate(
                    get_states_mapping(
                        member, content, state_target))

            message = mail_template['template'].format(
                recipient_title=localizer.translate(_(getattr(member,
                                                            'user_title', ''))),
                recipient_first_name=getattr(member, 'first_name', member.name),
                recipient_last_name=getattr(member, 'last_name', ''),
                state_source=state_source,
                state_target=state_target,
                subject_title=content.title,
                subject_url=url,
                subject_type=localizer.translate(
                    _("The " + content.__class__.__name__.lower())),
                novaideo_title=root.title
                 )
            mailer_send(
                subject=subject,
                recipients=[member.email],
                sender=root.get_site_sender(),
                body=message)

    alert = ContentAlert(alert_kind='modified')
    root.addtoproperty('alerts', alert)
    alert.init_alert(all_users, [content])


@subscriber(CorrelableRemoved)
def mysubscriber_correlable_removed(event):
    root = getSite()
    removed_object = event.object
    #get all versions. Versions will be removed
    all_versions = getattr(removed_object, 'history', [])
    if removed_object in all_versions:
        all_versions.remove(removed_object)

    #recuperate all correlations
    source_correlations = removed_object.source_correlations
    [source_correlations.extend(getattr(version, 'source_correlations', []))
     for version in all_versions]
    #destroy all versions
    if hasattr(removed_object, 'destroy'):
        removed_object.destroy()

    #update correlations
    for correlation in source_correlations:
        for target in list(correlation.targets):
            correlation.delfromproperty('targets', target)

        root.delfromproperty('correlations', correlation)


@subscriber(ApplicationCreated)
def init_application(event):
    app = event.object
    registry = app.registry
    request = Request.blank('/application_created') # path is meaningless
    request.registry = registry
    manager.push({'registry': registry, 'request': request})
    root = app.root_factory(request)
    request.root = root
    root.init_files()
    # other init functions
    init_contents(registry)

    transaction.commit()
    manager.pop()


def init_contents(registry):
    """Init searchable content"""
    core.SEARCHABLE_CONTENTS = {
        type_id: c
        for type_id, c in registry.content.content_types.items()
        if core.SearchableEntity in c.mro()
    }
