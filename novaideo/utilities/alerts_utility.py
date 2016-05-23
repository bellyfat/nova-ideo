# -*- coding: utf8 -*-
# Copyright (c) 2015 by Ecreall under licence AGPL terms
# avalaible on http://www.gnu.org/licenses/agpl.html

# licence: AGPL
# author: Amen Souissi

import json
from urllib.request import urlopen

from novaideo.ips.mailer import mailer_send
# from novaideo.content.resources import (
#     arango_server, create_collection)
from novaideo.content.alert import INTERNAL_ALERTS
from novaideo import log


SLACK_CHANNELS = {
    'questionnaire': {'url': 'https://hooks.slack.com/services/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',
                      'name': 'questionnaires'},
    'improve': {'url': 'https://hooks.slack.com/services/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',
                'name': 'ameliorations'},
    'lac_contact': {'url': 'https://hooks.slack.com/services/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',
                    'name': 'lac_contact'},
}


def alert_slack(senders=[], recipients=[], **kwargs):
    """
        recipients: ['improve', 'questionnaire']
    """
    for recipient in recipients:
        channel_data = SLACK_CHANNELS[recipient]
        kwargs['channel'] = "#" + channel_data['name']
        kwargs['username'] = 'webhookbot'
        kwargs = 'payload=' + json.dumps(kwargs)
        url = channel_data['url']
        urlopen(url, kwargs.encode())


# def alert_arango(senders=[], recipients=[], **kwargs):
#     """
#         recipients: ['creationculturelle.improve']
#     """
#     for recipient in recipients:
#         recipient_parts = recipient.split('.')
#         db_id = recipient_parts[0]
#         collection_id = recipient_parts[1]
#         db = arango_server.db(db_id)
#         if db:
#             collection = create_collection(db, collection_id)
#             collection.create_document(kwargs)


def alert_email(senders=[], recipients=[], **kwargs):
    """
        recipients: ['mail@mail.com']
    """
    sender = senders[0]
    subject = kwargs.get('subject', '')
    mail = kwargs.get('body', None)
    html = kwargs.get('html', None)
    attachments = kwargs.get('attachments', [])
    if mail or html:
        mailer_send(
            subject=subject, body=mail,
            html=html, attachments=attachments,
            recipients=recipients, sender=sender)


def alert_internal(senders=[], recipients=[], **kwargs):
    """
        recipients: [user1, user2],
        kwargs: {'internal_kind': 'content_alert',...}
    """
    kind = kwargs.pop('internal_kind', None)
    alert_class = INTERNAL_ALERTS.get(kind, None)
    if alert_class:
        subjects = kwargs.pop('subjects', [])
        sender = senders[0]
        alert = alert_class(**kwargs)
        sender.addtoproperty('alerts', alert)
        alert.init_alert(recipients, subjects)


def alert(kind="", senders=[], recipients=[], **kwargs):
    alert_op = ALERTS.get(kind, None)
    if alert_op:
        return alert_op(senders, recipients, **kwargs)

    log.warning("Alert kind {kind} not implemented".format(kind=kind))
    return None


ALERTS = {
    'internal': alert_internal,
    'slack': alert_slack,
    # 'arango': alert_arango,
    'email': alert_email
}