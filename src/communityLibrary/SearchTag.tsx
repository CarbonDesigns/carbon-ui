import * as React from "react";
import { Link, InjectedRouter } from "react-router";

export function SearchTag(props: {text: string}) {
    return <Link className="search-tag" to={"/library?s=tags:" + props.text}>
        {props.text}
    </Link>
}