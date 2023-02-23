import React from 'react';
import './SecurityInfoMonitoring.scss'; 



function SecurityInforMonito(props){return(
    <React.Fragment> {/* --------------------------Security Information Monitoring---------------------- */}
        <div className="euiCard__content">
            <span id="i348c8d71-add1-11ed-8fa9-574084b32ad0Title" className="euiTitle euiText euiText--small euiCard__title"></span>

            <div id="if8a38b21-adca-11ed-ad34-01019cb455e7Description" className="euiText euiText--small euiCard__description">
                <p></p>
                
                </div>
            </div>
            <div className="euiSpacer euiSpacer--s"></div>

            <div className="euiFlexGrid euiFlexGrid--gutterLarge euiFlexGrid--halves euiFlexGrid--responsive"> 
                
                <div className="euiFlexItem">{/* display:flex; display:flex; ----------------------------Security Events------------------------- */}
                    <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--horizontal euiCard--isClickable euiCard--hasIcon homSynopsis__card" data-test-subj="overviewWelcomeGeneral">
                        <div className="euiCard__top">
                            <svg className="euiIcon euiIcon--xLarge euiIcon--primary euiIcon--app euiIcon-isLoaded euiCard__icon" width="" height="" viewBox="0 0 32 32" 
                            xmlns="http://www.w3.org/2000/svg" focusable="false" role="img">

                                <path d="M29 9H3a3 3 0 01-3-3V3a3 3 0 013-3h26a3 3 0 013 3v3a3 3 0 01-3 3zM3 2a1 1 0 00-1 1v3a1 1 0 001 1h26a1 1 0 001-1V3a1 1 0 00-1-1H3z"></path>
                                <path className="euiIcon__fillSecondary" d="M12 20H3a3 3 0 01-3-3v-3a3 3 0 013-3h9a3 3 0 013 3v3a3 3 0 01-3 3zm-9-7a1 1 0 00-1 1v3a1 1 0 001 1h9a1 1 0 001-1v-3a1 1 0 00-1-1H3z"></path>
                                <path d="M12 31H3a3 3 0 01-3-3v-3a3 3 0 013-3h9a3 3 0 013 3v3a3 3 0 01-3 3zm-9-7a1 1 0 00-1 1v3a1 1 0 001 1h9a1 1 0 001-1v-3a1 1 0 00-1-1H3z"></path>
                                <path className="euiIcon__fillSecondary" d="M29 31h-9a3 3 0 01-3-3V14a3 3 0 013-3h9a3 3 0 013 3v14a3 3 0 01-3 3zm-9-18a1 1 0 00-1 1v14a1 1 0 001 1h9a1 1 0 001-1V14a1 1 0 00-1-1h-9z"></path>
                            </svg>
                        </div>
                    
                        <div className="euiCard__content">
                            <span className="euiTitle euiCard__title">
                                <button className="euiCard__titleButton" aria-describedby=" i348c8d73-add1-11ed-8fa9-574084b32ad0Description">
                                    {props.SecurityNAME}
                                </button>                        
                            </span>
                            <div className="euiText euiText--small euiCard__description " id="i348c8d73-add1-11ed-8fa9-574084b32ad0Description">
                                <p> {props.message1} </p>
                            </div>
                        </div>
                    </div>
                </div> {/* ----------------------------------Security Events------------------------------------- */}

                <div className="euiFlexItem">{/* display:flex;  display:flex; ----------------------------Information MOnitoring------------------------- */}
                    <div className="euiCard euiCard--paddingMedium euiCard--centerAligned euiCard--horizontal euiCard--isClickable euiCard--hasIcon homSynopsis__card" data-test-subj="overviewWelcomeGeneral">
                
                        <div className="euiCard__top">
                            <svg className="euiIcon euiIcon--xLarge euiIcon--primary euiIcon--app euiIcon-isLoaded euiCard__icon" width="" height="" viewBox="0 0 32 32" 
                            xmlns="http://www.w3.org/2000/svg" focusable="false" role="img" >
                                <path className="euiIcon__fillSecondary" d="M8 18h16v2H8zM8 13h9v2H8zM8 23h16v2H8z"></path>                                
                                <path  d="M21.41 0H5a3 3 0 00-3 3v26a3 3 0 003 3h22a3 3 0 003-3V8.59L21.41 0zM22 3.41L26.59 8H22V3.41zM27 30H5a1 1 0 01-1-1V3a1 1 0 011-1h15v8h8v19a1 1 0 01-1 1z"></path>
                            </svg>
                        </div>

                        <div className="euiCard__content">
                            <span className="euiTitle euiCard__title" id="i348cb481-add1-11ed-8fa9-574084b32ad0Title">
                                <button className="euiCard__titleButton" aria-describedby=" i348c8d73-add1-11ed-8fa9-574084b32ad0Description">
                                    {props.IntegrityNAME}
                                </button>                        
                            </span>
                            <div className="euiText euiText--small euiCard__description " id="i348cb481-add1-11ed-8fa9-574084b32ad0Description">
                                <p> {props.message2} </p>
                            </div>
                        </div>
                    </div>
                </div> {/* ----------------------------------Information Monitoring------------------------------------- */}
            
        
        </div>


        <span className="euiCard__betaBadgeWrapper">
            <span id="i348c8d71-add1-11ed-8fa9-574084b32ad0BetaBadge" className="euiBetaBadge euiCard__betaBadge">
                {props.CardTitle}
            </span>
        </span>       
        
        {/*----------------------------------------------Security Information Monitoring--------------------- */}
    </React.Fragment>
);
}

export default SecurityInforMonito;