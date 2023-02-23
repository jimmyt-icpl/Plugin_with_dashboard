import React from 'react';
import './AgentFlexItem.scss';
import './SecurityInfoMonitoring.scss';


function AgentFlexItemcomp() { 
    return(
    <React.Fragment>
        <div className="euiFlexItem">
            <div className="euiStat euiStat--centerAligned">
                <div className="euiText euiText--small euiStat__description"><p> Total Agents </p></div>
                <p className="euiTitle euiTitle--large euiStat__title euiStat__title--primary"> <span className="AgentToolTipAnchor"> <span className= "AgentstateWithLink"> Security Monitoring  </span> </span> </p>
            </div>
        </div>   
    </React.Fragment>
);
}
export default AgentFlexItemcomp;



// export const AgentFlexItemcomp = () => {
//     return(
//         <React.Fragment>
//             <div classname="AgentFlexItem">
//                 <div className="AgentState">
//                     <div classname="AgentText"><p>Total agent</p></div>
//                     <p className="AgentTitle"> <span className="AgentToolTipAnchor"> <span classname= "AgentstateWithLink"></span> </span> </p>
//                 </div>
//             </div>   
//         </React.Fragment>
//     );
// };