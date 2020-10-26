import React from "react";
import "./UserPage.css";
//import './MessageThread.css';

class UserPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: true,
            error: null,
            withReplies: this.props.withReplies,
            timeline: [],
        };
    }

    componentDidMount() {
        this.loadEvents();
    }

    async loadEvents() {
        this.setState({
            loading: true,
        });
        // ensure we are following this user. In the future we can view without following
        // by using /peek but we don't have that for now.
        let roomId;
        try {
            roomId = await this.props.client.followUser(this.props.userId);
        } catch (err) {
            this.setState({
                error: JSON.stringify(err),
            });
        } finally {
            this.setState({
                loading: false,
            });
        }
        let timeline = await this.props.client.getTimeline(roomId);
        this.setState({
            timeline: timeline,
        });
    }

    handleInputChange(event) {
        const target = event.target;
        const value =
            target.type === "checkbox" ? target.checked : target.value;
        const name = target.name;
        this.setState({
            [name]: value,
        });
    }

    async onPostClick(ev) {
        let msg = "Hello world";
        await this.props.client.postToUsers([this.props.client.userId], {
            msgtype: "m.text",
            body: msg,
        });
        this.forceUpdate();
    }

    postButton() {
        if (!this.props.client.accessToken) {
            return <div />;
        }
        return <button onClick={this.onPostClick.bind(this)}>Post</button>;
    }

    render() {
        let timelineBlock;
        let errBlock;
        if (this.state.error) {
            errBlock = (
                <div className="errblock">
                    Whoops! Something went wrong: {this.state.error}
                </div>
            );
        } else {
            if (this.state.loading) {
                timelineBlock = <div> Loading timeline.... </div>;
            } else {
                timelineBlock = (
                    <div>
                        {this.props.userId}'s' Page --
                        <label>
                            With Replies:
                            <input
                                name="withReplies"
                                type="checkbox"
                                checked={this.state.withReplies}
                                onChange={this.handleInputChange.bind(this)}
                            />
                        </label>
                        <div>
                            {this.state.timeline.map((ev) => {
                                return <div>{JSON.stringify(ev)}</div>;
                            })}
                        </div>
                    </div>
                );
            }
        }

        return (
            <div className="UserPage">
                {errBlock}
                {this.postButton()}
                {timelineBlock}
            </div>
        );
    }
}

/*
if (path[1] === undefined) {
            msgs = this.props.client.getMsgs(userId, false, null);
            this.state.page = "user";
        } else if (path[1] === "with_replies") {
            msgs = this.props.client.getMsgs(userId, true, null);
            this.state.page = "user";
        } else if (path[1] === "status") {
            msgs = this.props.client.getMsgs(userId, true, path[2]);
            this.state.page = "status";
            // FIXME: as well as looking for replies to this
            // message, we also need to hunt for parents,
            // particularly if they are in other rooms.
        }
        */

export default UserPage;
