import React from "react";
import separatorOr from "../shared/SeparatorOr";
import { backend } from "carbon-api";
import { LoginProviders } from "../Constants";

interface ISocialsProps{
    message: string;
}

function onClick(e){
    var provider = e.currentTarget.dataset.provider;
    backend.loginExternal(provider);
}

var Socials: React.StatelessComponent<ISocialsProps> = props =>
    <div className="form__text signup__alternative">
        {separatorOr(props.message, "translateme")}
        <div className="signup__with-socials">
            {
                LoginProviders.map(p =>
                    <div className={"signup__social signup__social_" + p.toLowerCase()} onClick={onClick} data-provider={p} key={p}>
                        <div className={"ico-social ico-social_" + p.toLowerCase()}></div>
                    </div>)
            }
        </div>
    </div>;

export default Socials;