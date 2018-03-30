import * as React from "react";
import { InfoCode } from "./Constants";
import { FormattedMessage } from "react-intl";

interface IInfoPageProps{
    params: {
        code: InfoCode
    }
}
export default class InfoPage extends React.Component<IInfoPageProps>{
    render(){
        var code = this.props.params.code;
        return <FormattedMessage id={"@" + code}/>
    }
}