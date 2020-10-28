import React from "react";
import "./Message.css";
import { ClientContext } from "./ClientContext";

class Message extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            error: null,
        };
    }
    async onReplyClick() {
        const replyTargets = this.getReplyTargets();
        let reply = prompt(
            `Enter your reply (replying to ${replyTargets.join(", ")})`
        );
        reply = reply + " " + replyTargets.join(" ");

        const content = {
            body: reply,
            msgtype: "m.text",
            "m.relationship": {
                rel_type: "m.reference",
                event_id: this.props.event.event_id,
            },
        };

        this.setState({
            loading: true,
        });
        try {
            await this.context.postToUsers([this.context.userId], content);
        } catch (err) {
            console.error(err);
            this.setState({
                error: err,
            });
        } finally {
            this.setState({
                loading: false,
            });
        }
    }

    getReplyTargets() {
        const body = this.props.event.content.body;
        let targets = Array.from(body.matchAll(/(@.*?:.*?)\b/g));
        const targetHash = {};
        for (let target of targets) {
            targetHash[target]++;
        }
        targetHash[this.props.event.sender]++;
        return Object.keys(targetHash);
    }

    renderTime(ts) {
        if (!ts) {
            return <span>Now</span>;
        }
        return <span>{new Date(ts).toLocaleString()}</span>;
    }

    renderEvent() {
        const event = this.props.event;
        if (!event) {
            return <div></div>;
        }
        return (
            <div>
                <span className="MessageHeader">
                    {event.sender} · {this.renderTime(event.origin_server_ts)}
                </span>
                <div>{event.content.body}</div>
            </div>
        );
    }

    render() {
        return (
            <div className="Message">
                {this.renderEvent()}
                <button
                    onClick={this.onReplyClick.bind(this)}
                    disabled={this.state.loading}
                >
                    Reply
                </button>
                {this.state.error ? (
                    <div>Error: {JSON.stringify(this.state.error)}</div>
                ) : (
                    <div />
                )}
            </div>
        );
    }
}
Message.contextType = ClientContext;

export default Message;
