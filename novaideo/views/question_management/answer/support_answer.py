# Copyright (c) 2014 by Ecreall under licence AGPL terms 
# avalaible on http://www.gnu.org/licenses/agpl.html 

# licence: AGPL
# author: Amen Souissi

from pyramid.view import view_config

from dace.processinstance.core import DEFAULTMAPPING_ACTIONS_VIEWS
from pontus.view import BasicView

from novaideo.content.processes.question_management.behaviors import (
    SupportAnswer)
from novaideo.content.question import Answer
from novaideo import _


@view_config(
    name='supportanswer',
    context=Answer,
    renderer='pontus:templates/views_templates/grid.pt',
    )
class SupportAnswerView(BasicView):
    title = _('Support')
    name = 'supportanswer'
    behaviors = [SupportAnswer]
    viewid = 'supportanswer'

    def update(self):
        results = self.execute(None)
        return results[0]


DEFAULTMAPPING_ACTIONS_VIEWS.update(
    {SupportAnswer: SupportAnswerView})
