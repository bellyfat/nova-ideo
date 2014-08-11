from dace.processdefinition.processdef import ProcessDefinition
from dace.processdefinition.activitydef import ActivityDefinition
from dace.processdefinition.gatewaydef import (
    ExclusiveGatewayDefinition,
    ParallelGatewayDefinition)
from dace.processdefinition.transitiondef import TransitionDefinition
from dace.processdefinition.eventdef import (
    StartEventDefinition,
    EndEventDefinition)
from dace.objectofcollaboration.services.processdef_container import process_definition
from pontus.core import VisualisableElement

from .behaviors import (
    InviteUsers,
    UploadUsers,
    SeeInvitation,
    SeeInvitations,
    EditInvitations,
    EditInvitation)
from novaideo import _


@process_definition(name='invitationmanagement', id='invitationmanagement')
class InvitationManagement(ProcessDefinition, VisualisableElement):
    isUnique = True

    def __init__(self, **kwargs):
        super(InvitationManagement, self).__init__(**kwargs)
        self.title = _('Invitations management')
        self.description = _('Invitations management')

    def _init_definition(self):
        self.defineNodes(
                start = StartEventDefinition(),
                pg = ParallelGatewayDefinition(),
                add = ActivityDefinition(contexts=[UploadUsers],
                                       description="Upload users from xl file",
                                       title="Upload users",
                                       groups=['Invite']),
                invite = ActivityDefinition(contexts=[InviteUsers],
                                       description=_("Invite users"),
                                       title=_("Invite users"),
                                       groups=[_('Invite')]),
                seeinvitation = ActivityDefinition(contexts=[SeeInvitation],
                                       description=_("See the invitation"),
                                       title=_("Details"),
                                       groups=[]),
                seeinvitations = ActivityDefinition(contexts=[SeeInvitations],
                                       description=_("See the invitations"),
                                       title=_("Invitations"),
                                       groups=[]),
                edits = ActivityDefinition(contexts=[EditInvitations],
                                       description=_("Edit invitations"),
                                       title=_("Edit invitations"),
                                       groups=[_('Edit')]),
                edit = ActivityDefinition(contexts=[EditInvitation],
                                       description=_("Edit invitation"),
                                       title=_("Edit invitation"),
                                       groups=[_('Edit')]),
                eg = ExclusiveGatewayDefinition(),
                end = EndEventDefinition(),
        )
        self.defineTransitions(
                TransitionDefinition('start', 'pg'),
                TransitionDefinition('pg', 'add'),
                TransitionDefinition('pg', 'invite'),
                TransitionDefinition('pg', 'edits'),
                TransitionDefinition('pg', 'edit'),
                TransitionDefinition('add', 'eg'),
                TransitionDefinition('pg', 'seeinvitation'),
                TransitionDefinition('seeinvitation', 'eg'),
                TransitionDefinition('pg', 'seeinvitations'),
                TransitionDefinition('seeinvitations', 'eg'),
                TransitionDefinition('invite', 'eg'),
                TransitionDefinition('edits', 'eg'),
                TransitionDefinition('edit', 'eg'),
                TransitionDefinition('eg', 'end'),
        )
