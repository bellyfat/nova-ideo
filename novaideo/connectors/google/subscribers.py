# -*- coding: utf8 -*-
# Copyright (c) 2017 by Ecreall under licence AGPL terms
# available on http://www.gnu.org/licenses/agpl.html

# licence: AGPL
# author: Amen Souissi

from pyramid.events import subscriber, ApplicationCreated
from pyramid.config import Configurator
from pyramid.request import Request

from velruse.providers.google_oauth2 import add_google_login
from novaideo.connectors.core import GOOGLE_CONNECTOR_ID


@subscriber(ApplicationCreated)
def init_application(event):
    app = event.object
    registry = app.registry
    request = Request.blank('/application_created') # path is meaningless
    request.registry = registry
    root = app.root_factory(request)
    config = Configurator(registry=registry, autocommit=True)
    google_connectors = list(root.get_connectors(GOOGLE_CONNECTOR_ID))
    if google_connectors:
        connector = google_connectors[0]
        name = connector.connector_id
        add_google_login(
	        config,
            consumer_key=connector.consumer_key,
            consumer_secret=connector.consumer_secret,
            login_path='/login/'+name,
            callback_path='/login/'+name+'/callback',
            name=name)
