import React, { useState } from 'react';
import { i18n } from '@osd/i18n';
import { FormattedMessage, I18nProvider } from '@osd/i18n/react';
import { BrowserRouter as Router } from 'react-router-dom';

import './AgentUI.scss';
import './AgentFlexItem.scss';
import AgentFlexItemcomp from './AgentFlexItemcomp';
import SecurityInforMonito from './SecurityInforMonito';
import './SecurityInfoMonitoring.scss'; 

import {
  EuiButton,
  EuiHorizontalRule,
  EuiPage,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentBody,
  EuiPageContentHeader,
  EuiPageHeader,
  EuiTitle,
  EuiText,
} from '@elastic/eui';

import { CoreStart } from '../../../../src/core/public';
import { NavigationPublicPluginStart } from '../../../../src/plugins/navigation/public';

import { PLUGIN_ID, PLUGIN_NAME } from '../../common';

interface HelloWorldAppDeps {
  basename: string;
  notifications: CoreStart['notifications'];
  http: CoreStart['http'];
  navigation: NavigationPublicPluginStart;
}

export const HelloWorldApp = ({ basename, notifications, http, navigation }: HelloWorldAppDeps) => {
  // Use React hooks to manage state.
  const [timestamp, setTimestamp] = useState<string | undefined>();

  const onClickHandler = () => {
    // Use the core http service to make a response to the server API.
    http.get('/api/hello_world/example').then((res) => {
      setTimestamp(res.time);
      // Use the core notifications service to display a success message.
      notifications.toasts.addSuccess(
        i18n.translate('helloWorld.dataUpdated', {
          defaultMessage: 'Data updated',
        })
      );
    });
  };

  // Render the application DOM.
  // Note that `navigation.ui.TopNavMenu` is a stateful component exported on the `navigation` plugin's start contract.
  return (
    <Router basename={basename}>
      <I18nProvider>
        <>
          <navigation.ui.TopNavMenu
            appName={PLUGIN_ID}
            showSearchBar={true}
            useDefaultBehaviors={true}
          />

          <div className="euiPage">
            <div className="euiFlexGroup euiFlexGroup--gutterLarge euiFlexGroup--directionRow euiFlexGroup--responsive">
              
              <AgentFlexItemcomp />
              <AgentFlexItemcomp />
              <AgentFlexItemcomp />
              <AgentFlexItemcomp/>
              <AgentFlexItemcomp />
              
            </div>
          </div>
          <br />

            <div className="euiPage wz-welcome-page">
              <div className="euiFlexGroup euiFlexGroup--gutterLarge euiFlexGroup--directionRow euiFlexGroup--responsive">
                <div className="euiFlexItem">


                  <div className="euiFlexGroup euiFlexGroup--gutterLarge euiFlexGroup--directionRow euiFlexGroup--responsive">
                    
                    <div className="euiFlexItem">
                      <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--hasBetaBadge euiCard--hasChildren">
                        < SecurityInforMonito SecurityNAME="Security Events" IntegrityNAME="Integrity Monitoring"
                        message1="Browse through Security alerts, issues and threats in your environment." 
                        message2="Alert related to file changes including permissions, content, ownership and attribute."
                        CardTitle="Security Information Monitoring"
                        />
                      </div>
                    </div>

                    <div className="euiFlexItem">
                      <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--hasBetaBadge euiCard--hasChildren">
                        < SecurityInforMonito SecurityNAME="Policy Monitoring" IntegrityNAME="System Auditing"
                        message1="Verify that your system are configured according to your security ploicies baseline." 
                        message2="Audit users behavior, monitoring command execution and alerting on acess to critical files."
                        CardTitle="Auditing and Policy Monitoring"
                        />
                      </div>
                    </div>

                  </div>


                  <div className="euiSpacer euiSpacer--xl"></div>


                  <div className="euiFlexGroup euiFlexGroup--gutterLarge euiFlexGroup--directionRow euiFlexGroup--responsive">
                    
                    <div className="euiFlexItem">
                      <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--hasBetaBadge euiCard--hasChildren">
                        < SecurityInforMonito SecurityNAME="Vulnerabilities" IntegrityNAME="MITRE ATT&CK"
                        message1="Discover what application in your environment are affected by well known vulnerabilities." 
                        message2="Security events from knowledge base of adversary tactics and techniques based real-world observations."
                        CardTitle="Threat Detection and Response"
                        />
                  
                      </div>
                    </div>

                    <div className="euiFlexItem">
                      <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--hasBetaBadge euiCard--hasChildren">
                        < SecurityInforMonito SecurityNAME="PCI DSS" IntegrityNAME="NIST 800-53"
                        message1="Browse through Security alerts, issues and threats in your environment." 
                        message2="Alert related to file changes including permissions, content, ownership and attribute."
                        CardTitle="Regulatory Compliance"
                        />
                  
                      </div>
                    </div>

                  </div>


                </div>
              </div>
            </div>



















          {/* <EuiPage restrictWidth="1000px">
            <EuiPageBody component="main">
              <EuiPageHeader>
                <EuiTitle size="l">
                  <h1>
                    <FormattedMessage
                      id="helloWorld.helloWorldText"
                      defaultMessage="{name}"
                      values={{ name: PLUGIN_NAME }}
                    />
                  </h1>
                </EuiTitle>
              </EuiPageHeader>
              <EuiPageContent>
                <EuiPageContentHeader>
                  <EuiTitle>
                    <h2>
                      <FormattedMessage
                        id="helloWorld.congratulationsTitle"
                        defaultMessage="Congratulations, you have successfully created a new OpenSearch Dashboards Plugin!"
                      />
                    </h2>
                  </EuiTitle>
                </EuiPageContentHeader>
                <EuiPageContentBody>
                  <EuiText>
                    <p>
                      <FormattedMessage
                        id="helloWorld.content"
                        defaultMessage="Look through the generated code and check out the plugin development documentation."
                      />
                    </p>
                    <EuiHorizontalRule />
                    <p>
                      <FormattedMessage
                        id="helloWorld.timestampText"
                        defaultMessage="Last timestamp: {time}"
                        values={{ time: timestamp ? timestamp : 'Unknown' }}
                      />
                    </p>

                    <EuiButton type="primary" size="s" onClick={onClickHandler}>
                      <FormattedMessage id="helloWorld.buttonText" defaultMessage="Get data" />
                    </EuiButton>
                  </EuiText>
                </EuiPageContentBody>
              </EuiPageContent>
            </EuiPageBody>
          </EuiPage> */}





        </>
      </I18nProvider>
    </Router>
  );
};
