# -*- coding: utf8 -*-
# Copyright (c) 2017 by Ecreall under licence AGPL terms
# available on http://www.gnu.org/licenses/agpl.html

# licence: AGPL
# author: Amen Souissi

from dace.processdefinition.processdef import ProcessDefinition
from dace.processdefinition.activitydef import ActivityDefinition
from dace.processdefinition.gatewaydef import (
    ExclusiveGatewayDefinition,
    ParallelGatewayDefinition)
from dace.processdefinition.transitiondef import TransitionDefinition
from dace.processdefinition.eventdef import (
    StartEventDefinition,
    EndEventDefinition)
from dace.objectofcollaboration.services.processdef_container import (
    process_definition)
from pontus.core import VisualisableElement

from novaideo.connectors.core import CONNECTOR_PROCESSES
from .behaviors import (
    LogIn,
    CreateConnector,
    Configure,
    Remove)
    # Import)
from novaideo import _


@process_definition(name='twitterprocess', id='twitterprocess')
class TwitterProcess(ProcessDefinition, VisualisableElement):
    isUnique = True

    def __init__(self, **kwargs):
        super(TwitterProcess, self).__init__(**kwargs)
        self.title = _('Twitter process')
        self.description = _('Twitter process')

    def _init_definition(self):
        self.defineNodes(
                start = StartEventDefinition(),
                #egs = ExclusiveGatewayDefinition(),
                login = ActivityDefinition(contexts=[LogIn],
                                       description=_("Login with Twitter"),
                                       title=_("Login with Twitter"),
                                       groups=[]),
                create = ActivityDefinition(contexts=[CreateConnector],
                                       description=_("Add a Twitter connector"),
                                       title=_("Add a Twitter connector"),
                                       groups=[]),
                configure = ActivityDefinition(contexts=[Configure],
                                       description=_("Configure the Twitter connector"),
                                       title=_("Configure"),
                                       groups=[]),
                remove = ActivityDefinition(contexts=[Remove],
                                       description=_("Remove the Twitter connector"),
                                       title=_("Remove"),
                                       groups=[]),
                # import_messages = ActivityDefinition(contexts=[Import],
                #                        description=_("Import messages from Twitter"),
                #                        title=_("Import"),
                #                        groups=[]),
                pg = ParallelGatewayDefinition(),
                eg = ExclusiveGatewayDefinition(),
                end = EndEventDefinition(),
        )
        self.defineTransitions(
                TransitionDefinition('start', 'pg'),
                TransitionDefinition('pg', 'login'),
                TransitionDefinition('login', 'eg'),
                TransitionDefinition('pg', 'create'),
                TransitionDefinition('create', 'eg'),
                TransitionDefinition('pg', 'configure'),
                TransitionDefinition('configure', 'eg'),
                TransitionDefinition('pg', 'remove'),
                TransitionDefinition('remove', 'eg'),
                # TransitionDefinition('pg', 'import_messages'),
                # TransitionDefinition('import_messages', 'eg'),
                TransitionDefinition('eg', 'end'),
        )

CONNECTOR_PROCESSES.append('twitterprocess')
