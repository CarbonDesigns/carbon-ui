import React from "react";
import { ErrorCode } from "./Constants";

interface IErrorPageProps{
    params: {
        code: ErrorCode
    }
}
export default class ErrorPage extends React.Component<IErrorPageProps>{
    render(){
        var code = this.props.params.code;
        var message;
        switch (code){
            case "unknownCompany":
                message = "Sorry, we cannot find requested user or company";
                break;
            case "appRunError":
                message = "Sorry, our app failed to start. We are investigating...";
                break;
            case "appNotFound":
                message = "The app you're looking for is not found";
                break;
            case "badShareCode":
                message = "The sharing code does not seem to be valid";
                break;
            default:
                message = "Sorry, an expected error occurred. We are already notified...";
                break;
        }
        return <span style={{color: "red", fontSize: 32}}>{message}</span>
    }
}