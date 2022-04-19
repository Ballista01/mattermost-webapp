// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import React, {memo, useEffect, useState, useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {FormattedMessage} from 'react-intl';

import Icon from '@mattermost/compass-components/foundations/icon/Icon';

import {getTopReactionsForTeam} from 'mattermost-redux/actions/teams';
import {getMyTopReactions} from 'mattermost-redux/actions/users';
import {getCurrentTeamId, getTopReactionsForCurrentTeam} from 'mattermost-redux/selectors/entities/teams';
import {getMyTopReactionsByTime} from 'mattermost-redux/selectors/entities/users';
import {GlobalState} from 'mattermost-redux/types/store';
import {TopReaction} from '@mattermost/types/reactions';

import {InsightsScopes} from 'utils/constants';

import BarChartLoader from '../skeleton_loader/bar_chart_loader/bar_chart_loader';
import CircleLoader from '../skeleton_loader/circle_loader/circle_loader';
import widgetHoc, {WidgetHocProps} from '../widget_hoc/widget_hoc';

import TopReactionsBarChart from './top_reactions_bar_chart/top_reactions_bar_chart';

import './../../activity_and_insights.scss';

const TopReactions = (props: WidgetHocProps) => {
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(true);
    const [topReactions, setTopReactions] = useState([] as TopReaction[]);

    const teamTopReactions = useSelector((state: GlobalState) => getTopReactionsForCurrentTeam(state, props.timeFrame, 5));
    const myTopReactions = useSelector((state: GlobalState) => getMyTopReactionsByTime(state, props.timeFrame, 5));

    useEffect(() => {
        if (props.filterType === InsightsScopes.TEAM) {
            setTopReactions(teamTopReactions);
        } else {
            setTopReactions(myTopReactions);
        }
    }, [props.filterType, props.timeFrame, teamTopReactions, myTopReactions]);

    const currentTeamId = useSelector(getCurrentTeamId);

    const getTopTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.TEAM) {
            setLoading(true);
            await dispatch(getTopReactionsForTeam(currentTeamId, 0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, currentTeamId, props.filterType]);

    useEffect(() => {
        getTopTeamReactions();
    }, [getTopTeamReactions]);

    const getMyTeamReactions = useCallback(async () => {
        if (props.filterType === InsightsScopes.MY) {
            setLoading(true);
            await dispatch(getMyTopReactions(0, 10, props.timeFrame));
            setLoading(false);
        }
    }, [props.timeFrame, props.filterType]);

    useEffect(() => {
        getMyTeamReactions();
    }, [getMyTeamReactions]);

    const skeletonLoader = useCallback(() => {
        const entries = [];
        for (let i = 0; i < 5; i++) {
            entries.push(
                <div
                    className='bar-chart-entry'
                    key={i}
                >
                    <BarChartLoader/>
                    <CircleLoader
                        size={20}
                    />
                </div>,
            );
        }
        return entries;
    }, []);

    return (
        <div className='top-reaction-container'>
            {
                loading &&
                skeletonLoader()
            }
            {
                (topReactions && !loading) &&
                <TopReactionsBarChart
                    reactions={topReactions}
                />
            }
            {
                (topReactions.length === 0 && !loading) &&
                <div className='empty-state'>
                    <div className='empty-state-emoticon'>
                        <Icon
                            glyph={'emoticon-outline'}
                        />
                    </div>
                    <div className='empty-state-text'>
                        <FormattedMessage
                            id='insights.topReactions.empty'
                            defaultMessage='Not enough data yet for this insight'
                        />
                    </div>
                </div>
            }

        </div>
    );
};

export default memo(widgetHoc(TopReactions));
