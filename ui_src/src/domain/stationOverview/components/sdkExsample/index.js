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

import React, { useEffect, useState } from 'react';
import { loader } from '@monaco-editor/react';
import Editor from '@monaco-editor/react';
import * as monaco from 'monaco-editor';

import { LOCAL_STORAGE_ENV, LOCAL_STORAGE_NAMESPACE } from '../../../../const/localStorageConsts';
import { PROTOCOL_CODE_EXAMPLE, SDK_CODE_EXAMPLE } from '../../../../const/codeExample';
import SelectComponent from '../../../../components/select';
import CustomTabs from '../../../../components/Tabs';
import Copy from '../../../../components/copy';

loader.config({ monaco });

const tabs = ['Producer', 'Consumer'];

const SdkExample = ({ consumer, showTabs = true }) => {
    const [langSelected, setLangSelected] = useState('Go');
    const [protocolSelected, setProtocolSelected] = useState('SDK (TCP)');
    const selectLngOption = ['Go', 'Node.js', 'TypeScript', 'Python'];
    const selectProtocolLngOptions = ['cURL', 'Go', 'Node.js', 'Python', 'Java', 'JavaScript - Fetch', 'JavaScript - jQuery'];
    const selectProtocolOption = ['SDK (TCP)', 'REST (HTTP)'];
    const [codeExample, setCodeExample] = useState({
        import: '',
        connect: '',
        producer: '',
        consumer: ''
    });
    const [tabValue, setTabValue] = useState(consumer ? 'Consumer' : 'Producer');

    const url = window.location.href;
    const stationName = url.split('stations/')[1];

    const changeDynamicCode = (lang) => {
        let codeEx = {};
        codeEx.producer = SDK_CODE_EXAMPLE[lang].producer;
        codeEx.consumer = SDK_CODE_EXAMPLE[lang].consumer;
        let host = process.env.REACT_APP_SANDBOX_ENV
            ? 'broker.sandbox.memphis.dev'
            : localStorage.getItem(LOCAL_STORAGE_ENV) === 'docker'
            ? 'localhost'
            : 'memphis-cluster.' + localStorage.getItem(LOCAL_STORAGE_NAMESPACE) + '.svc.cluster.local';
        codeEx.producer = codeEx.producer.replaceAll('<memphis-host>', host);
        codeEx.consumer = codeEx.consumer.replaceAll('<memphis-host>', host);
        codeEx.producer = codeEx.producer.replaceAll('<station-name>', stationName);
        codeEx.consumer = codeEx.consumer.replaceAll('<station-name>', stationName);
        setCodeExample(codeEx);
    };

    const changeProtocolDynamicCode = (lang) => {
        let codeEx = {};
        codeEx.producer = PROTOCOL_CODE_EXAMPLE[lang].producer;
        codeEx.tokenGenerate = PROTOCOL_CODE_EXAMPLE[lang].tokenGenerate;
        let host =
            localStorage.getItem(LOCAL_STORAGE_ENV) === 'docker'
                ? 'localhost'
                : 'memphis-http-proxy.' + localStorage.getItem(LOCAL_STORAGE_NAMESPACE) + '.svc.cluster.local';
        codeEx.producer = codeEx.producer.replaceAll('localhost', host);
        codeEx.producer = codeEx.producer.replaceAll('<station-name>', stationName);
        codeEx.tokenGenerate = codeEx.tokenGenerate.replaceAll('localhost', host);
        setCodeExample(codeEx);
    };

    useEffect(() => {
        protocolSelected === 'SDK (TCP)' ? changeDynamicCode(langSelected) : changeProtocolDynamicCode('cURL');
    }, []);

    const handleSelectLang = (e, isSdk = true) => {
        setLangSelected(e);
        isSdk ? changeDynamicCode(e) : changeProtocolDynamicCode(e);
    };

    const handleSelectProtocol = (e) => {
        setProtocolSelected(e);
        if (e === 'REST (HTTP)') {
            changeProtocolDynamicCode('cURL');
            setLangSelected('cURL');
        } else {
            setLangSelected('Go');
            changeDynamicCode('Go');
        }
    };

    const generateEditor = (langCode, value) => {
        return (
            <>
                <Editor
                    options={{
                        minimap: { enabled: false },
                        scrollbar: { verticalScrollbarSize: 0 },
                        scrollBeyondLastLine: false,
                        roundedSelection: false,
                        formatOnPaste: true,
                        formatOnType: true,
                        readOnly: true,
                        fontSize: '12px',
                        fontFamily: 'Inter'
                    }}
                    language={langCode}
                    height="calc(100% - 10px)"
                    width="calc(100% - 25px)"
                    value={value}
                />
                <Copy data={value} />
            </>
        );
    };

    return (
        <div className="code-example-details-container sdk-example">
            <div className="header-wrapper">
                <p>Code examples</p>
                <span>Some code snippets that will help you get started with Memphis</span>
            </div>
            <div className="select-lan">
                <div>
                    <p className="field-title">Protocol</p>
                    <SelectComponent
                        value={protocolSelected}
                        colorType="navy"
                        backgroundColorType="none"
                        borderColorType="gray"
                        radiusType="semi-round"
                        width="220px"
                        height="50px"
                        options={selectProtocolOption}
                        onChange={(e) => handleSelectProtocol(e)}
                        popupClassName="select-options"
                    />
                </div>
                <div>
                    <p className="field-title">Language</p>
                    <SelectComponent
                        value={langSelected}
                        colorType="navy"
                        backgroundColorType="none"
                        borderColorType="gray"
                        radiusType="semi-round"
                        width="220px"
                        height="50px"
                        options={protocolSelected === 'SDK (TCP)' ? selectLngOption : selectProtocolLngOptions}
                        onChange={(e) => (protocolSelected === 'SDK (TCP)' ? handleSelectLang(e) : handleSelectLang(e, false))}
                        popupClassName="select-options"
                    />
                </div>
            </div>
            {protocolSelected === 'SDK (TCP)' && (
                <>
                    <div className="installation">
                        <p className="field-title">Package installation</p>
                        <div className="install-copy">
                            <p>{SDK_CODE_EXAMPLE[langSelected].installation}</p>
                            <Copy data={SDK_CODE_EXAMPLE[langSelected].installation} />
                        </div>
                    </div>
                    <div className="tabs">
                        {showTabs && <CustomTabs value={tabValue} onChange={(tabValue) => setTabValue(tabValue)} tabs={tabs}></CustomTabs>}
                        {tabValue === 'Producer' && (
                            <div className="code-example">
                                <div className="code-content">{generateEditor(SDK_CODE_EXAMPLE[langSelected].langCode, codeExample.producer)}</div>
                            </div>
                        )}

                        {tabValue === 'Consumer' && (
                            <div className="code-example">
                                <div className="code-content">{generateEditor(SDK_CODE_EXAMPLE[langSelected].langCode, codeExample.consumer)}</div>
                            </div>
                        )}
                    </div>
                </>
            )}
            {protocolSelected === 'REST (HTTP)' && (
                <>
                    <div className="installation">
                        <p className="field-title">Step 1: Generate a token</p>
                        <div className="code-example ce-protoco">
                            <div className="code-content">{generateEditor(PROTOCOL_CODE_EXAMPLE[langSelected].langCode, codeExample.tokenGenerate)}</div>
                        </div>
                    </div>
                    <div className="tabs">
                        <p className="field-title">Step 2: Produce data</p>
                        <div className="code-example ce-protoco">
                            <div className="code-content produce">{generateEditor(PROTOCOL_CODE_EXAMPLE[langSelected].langCode, codeExample.producer)}</div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default SdkExample;
