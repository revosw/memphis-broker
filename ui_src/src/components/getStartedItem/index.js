// Copyright 2022-2023 The Memphis.dev Authors
// Licensed under the Memphis Business Source License 1.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
// Changed License: [Apache License, Version 2.0 (https://www.apache.org/licenses/LICENSE-2.0), as published by the Apache Foundation.
//
// https://github.com/memphisdev/memphis-broker/blob/master/LICENSE
//
// Additional Use Grant: You may make use of the Licensed Work (i) only as part of your own product or service, provided it is not a message broker or a message queue product or service; and (ii) provided that you do not use, provide, distribute, or make available the Licensed Work as a Service.
// A "Service" is a commercial offering, product, hosted, or managed service, that allows third parties (other than your own employees and contractors acting on your behalf) to access and/or use the Licensed Work or a substantial set of the features or functionality of the Licensed Work to third parties as a software-as-a-service, platform-as-a-service, infrastructure-as-a-service or other similar services that compete with Licensor products or services.

import './style.scss';

import React, { useContext } from 'react';

import { GetStartedStoreContext } from '../../domain/overview/getStarted';
import bgGetStartedBottom from '../../assets/images/bgGetStartedBottom.svg';
import { CONNECT_APP_VIDEO, CONNECT_CLI_VIDEO } from '../../config';
import bgGetStarted from '../../assets/images/bgGetStarted.svg';
import orangeBall from '../../assets/images/orangeBall.svg';
import purpleBall from '../../assets/images/purpleBall.svg';
import blackBall from '../../assets/images/blackBall.svg';
import pinkBall from '../../assets/images/pinkBall.svg';
import ConnectBG from '../../assets/images/connectBG.png';
import InstallingBG from '../../assets/images/installingBG.png';
import VideoPlayer from '../videoPlayer';
import Button from '../button';

const GetStartedItem = (props) => {
    const { headerImage, headerTitle, headerDescription, style, children, onNext, onBack } = props;
    const [getStartedState, getStartedDispatch] = useContext(GetStartedStoreContext);

    return (
        <div className="get-started-wrapper">
            {getStartedState?.currentStep !== 5 && (
                <>
                    <img className="get-started-bg-img" src={bgGetStarted} alt="bgGetStarted" />
                    <div className="get-started-top">
                        <div className="get-started-top-header">
                            <img className="header-image" src={headerImage} alt={headerImage} />
                            <p className="header-title">{headerTitle}</p>
                            <div className="header-description">{headerDescription}</div>
                        </div>
                        <div className="get-started-body">{children}</div>
                    </div>
                </>
            )}
            {getStartedState?.currentStep === 5 && (
                <>
                    <img className="get-started-bg-img" src={bgGetStarted} alt="bgGetStarted" />
                    <img className="get-started-bg-img-bottom" src={bgGetStartedBottom} alt="bgGetStartedBottom"></img>
                    <div className="get-started-top">
                        <div className="video-container">
                            <div className="video-section">
                                <div className="video-section-black-ball">
                                    <img className="black-ball" src={blackBall} alt="black-ball"></img>
                                </div>
                                <img className="orange-ball" src={orangeBall} alt="orange-ball"></img>
                                <VideoPlayer url={CONNECT_APP_VIDEO} bgImg={ConnectBG} />
                                <p className="video-description">Connect your first app to Memphis ✨</p>
                            </div>
                            <div className="video-section">
                                <img className="pink-ball" src={pinkBall} alt="pink-ball"></img>
                                <img className="purple-ball" src={purpleBall} alt="purple-ball"></img>
                                <VideoPlayer url={CONNECT_CLI_VIDEO} bgImg={InstallingBG} />
                                <p className="video-description">How to install and connect Memphis.dev CLI ⭐</p>
                            </div>
                        </div>
                        <div className="get-started-top-header finish">
                            <p className="header-title">{headerTitle}</p>
                            <div className="header-description">{headerDescription}</div>
                        </div>
                        <div className="get-started-body-finish">{children}</div>
                    </div>
                </>
            )}
            {!getStartedState.isHiddenButton && getStartedState?.currentStep !== 5 && (
                <div className="get-started-footer">
                    <div>
                        {getStartedState?.currentStep === 5 && (
                            <Button
                                width={getStartedState?.currentStep === 5 ? '190px' : '129px'}
                                height="36px"
                                placeholder={getStartedState?.currentStep === 5 ? 'Go to station' : 'Next'}
                                colorType="white"
                                radiusType="circle"
                                backgroundColorType={'purple'}
                                fontSize="16px"
                                fontWeight="bold"
                                htmlType="submit"
                                disabled={getStartedState?.nextDisable}
                                onClick={() => onNext()}
                                isLoading={getStartedState?.isLoading}
                            />
                        )}
                        <Button
                            width={getStartedState?.currentStep === 5 ? '190px' : '129px'}
                            height="36px"
                            placeholder={getStartedState?.currentStep === 5 ? 'Go to station' : 'Next'}
                            colorType="white"
                            radiusType="circle"
                            backgroundColorType={'purple'}
                            fontSize="16px"
                            fontWeight="bold"
                            htmlType="submit"
                            disabled={getStartedState?.nextDisable}
                            onClick={() => onNext()}
                            isLoading={getStartedState?.isLoading}
                        />
                    </div>
                    {getStartedState?.currentStep !== 1 && (
                        <Button
                            width={'129px'}
                            height="36px"
                            placeholder={'Back'}
                            colorType="white"
                            radiusType="circle"
                            backgroundColorType={'black'}
                            fontSize="16px"
                            fontWeight="bold"
                            htmlType="submit"
                            disabled={getStartedState?.currentStep === 1}
                            onClick={() => onBack()}
                            isLoading={getStartedState?.isLoading}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

export default GetStartedItem;
