import {Component, listenTo} from "../CarbonFlux";
import NotReady from '../shared/NotReady';
import React from 'react';
//import {FormattedHTMLMessage} from 'react-intl';
//import {msg} from '../intl/store';
import Panel from '../layout/Panel'
import {FormattedHTMLMessage} from "react-intl";
import ScrollContainer        from "../shared/ScrollContainer";
import { GuiButton } from "../shared/ui/GuiComponents";

import bem from '../utils/commonUtils';

function b(elem, mods, mix) {
    return bem("comment", elem, mods, mix)
}

// shared functions
//——————————————————————————————————————————————————————————————————————
//fixme - move this function to shared file
function hsv_to_rgb (h, s, v, format = 'rgb') {
    var b, f, g, i, p, q, r, t;
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - (f * s));
    t = v * (1 - ((1 - f) * s));
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    switch (format) {
        case 'array':
            return [r * 255, g * 255, b * 255];
        case 'rgb':
            return "rgb(" + ((r * 255).toFixed(0)) + ", " + ((g * 255).toFixed(0)) + ", " + ((b * 255).toFixed(0)) + ")";
    }
}

//fixme - move this function to shared file
function _create_avatar_color_from_user_id (user_id, colors_in_gamma = 38) {
    let almost_random_number, brightness, saturation, step;
    const _RANDOM_KOEF_1 = 171713;
    const _RANDOM_KOEF_2 = 42346727;
    almost_random_number = (_RANDOM_KOEF_1 * parseInt(user_id)) * _RANDOM_KOEF_2;
    step = almost_random_number % colors_in_gamma;
    saturation = .4;
    brightness = .8;
    return hsv_to_rgb(step / colors_in_gamma, saturation, brightness);
}

var _users = {
    0 : {id: 0, color: null, name: "Dennis",               "email" : "dennis@carbonium.com"                              },
    1 : {id: 1, color: null, name: "Alex",                 "email" : "alex@carbonium.com",    img : "/target/res/avas/avas9.png" },
    2 : {id: 2, color: null, name: "Mike",                 "email" : "ekel@carbonium.com",     img : "/target/res/avas/avas3.png"},
    3 : {id: 3, color: null, name: "MegaBoss",             "email" : "marina@gmail.com",      img : "/target/res/avas/avas4.png" },
    //4 : {id: 4, color: null, name: "Jessica Lancaster",    "email" : "",                    img : "/target/res/avas/avas5.png"},
    4 : {id: 4, color: null, name: "",    "email" : ""                     },
    5 : {id: 5, color: null, name: "Barbara Streisand",    "email" : "",                      img : "/target/res/avas/avas6.png" },
    6 : {id: 6, color: null, name: "Mikhail from Siberia", "email" : "",                      img : "/target/res/avas/avas7.png"},
    7 : {id: 7, color: null, name: "Client #123456",       "email" : "",                      img : "/target/res/avas/avas8.png" },
    8 : {id: 8, color: null, name: "",                     "email" : "nonickname@gmail.com",  img : "/target/res/avas/avas2.png"},
};

(function(){
    var user, user_id;
    for (user_id in _users) {
        user = _users[user_id];
        _users[user_id].color = _create_avatar_color_from_user_id(user.id);
    }
})();


var _comments = [
    {
        "number": 124,
        "date": "120172",
        "author": 0,
        "text": "A simple code snippet designed by CodePen's user Jmy Barbe. It provides a simple background with underlying lines, creating an interesting pattern that can be useful for organization and alignment purposes (you can see these) ",
        "replies": [{
            "id": "124-1",
            "author": 4,
            "text": "also we no need confirmation, because this action can be easily undone ",
            "date": "120172"
        }, {"id": "124-2", "author": 2, "text": "for what?", "date": "120172"}, {
            "id": "124-3",
            "author": 8,
            "text": "ok, but it was nice nice second line idea.))",
            "date": "120172"
        }, {
            "id": "124-4",
            "author": 6,
            "text": "you mean - max \\ min height? idk. min height is useful, i think. Or you\u2019re talking \u201cwhat for do we need resizing list\u201d? Isn\u2019t that obvious? to economize space if needed.",
            "date": "120172"
        }, {
            "id": "124-5",
            "author": 0,
            "text": "Also good to set name of shadow ninja, with info of who invited that shadow ninja",
            "date": "120172"
        }]
    }, {
        "number": 125,
        "date": "120172",
        "author": 1,
        "text": "A magnificent live background that displays groups of animated squares that fade in and out of the frame, reappearing in random places. Also, particles follow the movement of the mouse. Created by CodePen's user Eryk ",
        "replies": []
    }, {
        "number": 126,
        "date": "120172",
        "author": 3,
        "text": "This little code snippet serves as a demonstration for a Coderwall article that shows how to set canvas elements as body background in your projects. This example applies a subtle noise effect in order to provide a little bit of texture. ",
        "replies": [{"id": "126-1", "author": 8, "text": "text of commen", "date": "120172"}]
    }, {
        "number": 127,
        "date": "120172",
        "author": 1,
        "text": "Bring your website to life by applying CSS backgrounds with multiple effects and animations, using HTML5 and CSS.",
        "replies": [
            {"id": "127-1",  "author": 1, "text": "text of commen",   "date": "120172"},
            {"id": "127-2",  "author": 2, "text": "text of commen1",  "date": "120172"},
            {"id": "127-3",  "author": 0, "text": "text of commen",   "date": "120172"},
            {"id": "127-4",  "author": 7, "text": "text of commen2",  "date": "120172"},
            {"id": "127-5",  "author": 2, "text": "text of commen",   "date": "120172"},
            {"id": "127-6",  "author": 7, "text": "text of commen3",  "date": "120172"},
            {"id": "127-7",  "author": 6, "text": "text of commen",   "date": "120172"},
            {"id": "127-8",  "author": 5, "text": "text of commen4",  "date": "120172"},
            {"id": "127-9",  "author": 0, "text": "text of commen",   "date": "120172"},
            {"id": "127-10", "author": 4, "text": "text of commen5",  "date": "120172"},
            {"id": "127-11", "author": 1, "text": "text of commen",   "date": "120172"}]
    }
];



function _getUser (userId) {
    return _users[userId];
}




// common functions for this file
//——————————————————————————————————————————————————————————————————————

function _renderTime(date, className){
    var time = "Jan 09, 3:02"; //fixme 'M d, g:i'
    return <time key="time" className={className}>{time}</time>
}


function _renderAuthorName(author){
    return author.name || author.email || `user #${author.id}`
}

function MyReplyAvatar (){
    return <div className="reply__answer-my-avatar _-_-_-7" style={{
        backgroundImage: '' //fixme - insert own avatar
    }}></div>
}



function CommentAva({author, className}){
    const hasImage = author.img != null;
    let style;
    if (hasImage) {
        style = { backgroundImage: `url('${author.img}')`};
        return <i key="ava" className={`${className} ${className}_pic`} style={style}/>
    }
    else {
        style = { backgroundColor: author.color };
        let letter = author.name.substr(0,1);
        if (!letter) {
            letter = ":)"; //todo - what to do if no name? user id / user index inside the project??
        }
        return <b key="ava" className={`${className} ${className}_txt`} style={style}>{letter}</b>
    }
}


function CommentAction ({actionName, onClick}){
    let ico;
    switch (actionName) {
        case 'resolve' : ico = 'ico-resolve'; break;
        case 'edit'    : ico = 'ico-edit'   ; break;
        case 'delete'  : ico = 'ico-trash'  ;
    }
    //fixme todo translate title
    return <div
        key={"button_"+actionName}
        className="comment__action"
        title={`${actionName} comment`}
        onClick={onClick}
    >
        <i className={ico}/>
        <FormattedHTMLMessage tagName='span' id={actionName} defaultMessage={actionName} />
    </div>
}


function CommentOverlay ({isOpen, onEdit, onDelete, onResolve}) {
    //fixme todo translate title
    //{/*<div className={bem('comment', 'overlay-action', 'resolve')} onClick={onResolve}><i className='ico-resolve'/></div>*/}
    return <div className={bem('comment', 'overlay', {open: isOpen})}>
        {
            typeof onResolve==='function' &&
            <GuiButton className={bem('comment', 'overlay-action')} onClick={onResolve  } mods={['square', 'hover-white']} icon="resolve"/>
        }
        <GuiButton className={bem('comment', 'overlay-action')} onClick={onEdit  } mods={['square', 'hover-white']} icon="edit"/>
        <GuiButton className={bem('comment', 'overlay-action')} onClick={onDelete  } mods={['square', 'hover-delete']} icon="trash"/>
    </div>
    //{/*<GuiButton className={bem('comment', 'overlay-action', 'delete')} onClick={onDelete}><i className='ico-trash'  /></GuiButton>*/}
    //<GuiButton className={bem('comment', 'overlay-action', 'delete')} onClick={onDelete}><i className='ico-trash'  /></GuiButton>
}

class Reply extends Component {
    constructor(props) {
        super(props);
        this.state = {
            reply_overlay_is_open: false
        };
    }

    _addNicknameToReplyInput(ev){ console.log("_addNicknameToReplyInput"); }

    _deleteReply(ev){ console.log("_deleteReply"); }

    _editReply(ev){ console.log("_editReply"  ); }

    _closeActions(){
        this.setState({reply_overlay_is_open : false});
    };

    _toggleActions = (ev)=>{
        this.setState({reply_overlay_is_open : !this.state.reply_overlay_is_open});
    };


    render(){
        const reply   = this.props.reply;
        const comment = this.props.comment;

        const replyAuthor = _getUser(reply.author);
        const b = 'reply';
        const authorClassname = bem(b, "author", {"is-comment-author-too" : reply.author === comment.author});

        //return (<div className={bem('reply', null, { "menu-open" : this.state.reply_overlay_is_open})}>
        return <div className={bem(b)}>
            <div className={bem(b, 'body')}>
                <div className={bem(b, 'header')}>
                    <div className="comment__actions">
                        <div className="comment__menu">
                            <CommentAction actionName="edit" onClick={this._editReply} />
                            <CommentAction actionName="delete" onClick={this._deleteReply} />
                        </div>
                        <div className="comment__menu-call" onClick={this._toggleActions}><i/></div>
                    </div>


                    <div>
                        <CommentAva author={replyAuthor} className={bem(b, 'ava')} />
                        <b className="reply__number">#{reply.id}</b>
                        {_renderTime(reply.date, "reply__date")}
                    </div>

                    <p className={authorClassname} onClick={this._addNicknameToReplyInput}>{ _renderAuthorName(replyAuthor) }</p>
                </div>

                <blockquote className={bem(b, 'text')}>{reply.text}</blockquote>

                {/*
                <div className="reply__actions">
                    <CommentAction actionName="edit" onClick={this._editReply} />
                    <CommentAction actionName="delete" onClick={this._deleteReply} />
                </div>

                */}


            </div>

            <CommentOverlay
                isOpen={this.state.reply_overlay_is_open}
                onEdit={this._editReply}
                onDelete={this._deleteReply}
            />
        </div>

    }
}

class Comment extends Component {
    constructor(props) {
        super(props);
        this.state = {
            replies_are_open: false,
            comment_overlay_is_open: false
        };
    }



    _resolveComment(ev){ console.log("_resolveComment"); }
    _editComment(ev)   { console.log("_editComment"); }
    _deleteComment(ev) { console.log("_deleteComment"); }

    _toggleCommentActions = (ev)=>{
        this.setState({comment_overlay_is_open : !this.state.comment_overlay_is_open});
    };

    _closeCommentActions(){
        //fixme  - run this when panel is resized or when click outside overlay
        this.setState({comment_overlay_is_open : false});
    };


    _toggleRepliesList = (ev) =>{
        this.setState({replies_are_open : !this.state.replies_are_open});
    };




    _onReplySubmit(ev){
        ev.preventDefault();
        console.log("_submitReply");
        return false;
    }


    _renderReplies(comment){
        var replies_content = null;
        //todo immutability and probably shouldComponentUpdate. maybe move to another component for that purpose.
        var replies_amount = comment.replies.length;

        if (replies_amount === 0) {
            replies_content = [
                (<section  className="replies__actions"  key="replies__actions">
                    <div className="replies__add-reply  comment__inline-action  txt" onClick={this._toggleRepliesList}>
                        <i className="ico-add-reply"/><FormattedHTMLMessage defaultMessage="Add a reply" tagName="span" id="translateme!" />
                    </div>
                </section>)
            ];
        }
        else {
            //todo show correct word - reply (reply, replies)
            replies_content = [
                (<div  className="replies__actions"  key="replies__actions"  onClick={this._toggleRepliesList}>
                    <div className="replies__amount txt">
                        <i><span>{replies_amount}</span></i>
                        <FormattedHTMLMessage defaultMessage="replies" tagName="span" id="translateme!" values={{amount: replies_amount}}/>
                    </div>
                </div>),
                (<div className="replies-list" key="replies-list">
                    { comment.replies.map((reply)=>
                        <Reply  key={reply.id} reply={reply} comment={comment}/>
                    )}
                </div>)
            ];
        }

        var cn = b("replies", { collapsed: !this.state.replies_are_open});
        var input_placeholder = "your reply...";//fixme i18n placeholder for reply answer

        return (<section key="replies" className={cn}>
            { replies_content }
            <div className="reply__answer">
                <form className="reply__answer-input" onSubmit={this._onReplySubmit} >
                    <MyReplyAvatar/>
                    <textarea placeholder={input_placeholder} rows={1}/>
                    <button type="submit" className="reply__answer-submit">
                        <i className="ico-send"/>
                    </button>
                </form>
            </div>
        </section>);
    }


    render(){ // Comment.render
        const comment = this.props.comment; //todo immutable?
        const comment_author = _getUser(comment.author);

        // return <article className={bem('comment', null, { "menu-open" : this.state.comment_overlay_is_open})}>
        return <article className={bem('comment')}>
            <div className="comment__body">
                <header className="comment__header">
                    <div className="comment__actions">
                        <div className="comment__menu">
                            <CommentAction actionName="resolve" onClick={this._resolveComment} />
                            <CommentAction actionName="edit" onClick={this._editComment} />
                            <CommentAction actionName="delete" onClick={this._deleteComment} />
                        </div>
                        <div className="comment__menu-call" onClick={this._toggleCommentActions}><i/></div>
                    </div>

                    <CommentAva author={comment_author} className="comment__ava" />
                    <p className="comment__author">{ _renderAuthorName(comment_author) } </p>

                    <p>
                        <b className="comment__number">#{comment.number}</b>
                        {_renderTime(comment.date, "comment__date")}
                    </p>

                </header>

                <section className="comment__text txt">
                    {comment.text}
                </section>

                <CommentOverlay
                    isOpen={this.state.comment_overlay_is_open}
                    onEdit={this._editComment}
                    onDelete={this._deleteComment}
                    onResolve={this._resolveComment}
                />
            </div>

            {this._renderReplies(comment)}
        </article>

    }
}


class CommentsPanel extends Component {

    @listenTo(richApp.layoutStore)
    onLayoutChanged() {
        if(!this.refs.panel) {
            return; // can be called when panel is hidden
        }
        this.refs.panel.updateSizeClasses(); // fixme reset the state of open overlay?
    }

    render() {
        return (
            <Panel ref="panel" {...this.props} header="Comments" id="comments-panel" key={richApp.layoutStore.getLayoutName() + "comments-panel"}>
                <div id="comments-header">
                    <div className="create-comment">
                        <label>
                            <textarea className="create-comment__input"/>
                            <div className="create-comment__submit">
                                <i className="ico-send-big"/>
                            </div>
                            <div className="create-comment__opener">
                                <i className="ico-add-comment"/>
                                <div className="cap">{<FormattedHTMLMessage defaultMessage="Add comment" tagName="span" id="translateme!"/>}</div>
                            </div>
                        </label>
                    </div>
                </div>
                <div className="comments-panel__comments-list panel__stretcher ">
                    <ScrollContainer
                        className="comments-panel__comments-container  thin dark vertical"
                        insideFlyout={false}
                    >
                        { _comments.map( (comment)=>
                            <Comment key={comment.number} comment={comment}/>
                        ) }
                    </ScrollContainer>
                </div>
            </Panel>
        );
    }

}
export default CommentsPanel;
