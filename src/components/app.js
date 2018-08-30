import React, { Component } from 'react';
import Chatkit from '@pusher/chatkit';

import RoomList from './RoomList';
import MessageList from './MessageList';
import SendMessageForm from './SendMessageForm';
import NewRoomForm from './NewRoomForm';

import {tokenUrl,instanceLocator} from '../config';

export default class App extends Component {

    constructor(props){
      super(props);
      this.state={
        roomId:null,
        messages:[],
        joinableRooms:[],
        joinedRooms:[]
      };
      this.sendMessage=this.sendMessage.bind(this);
      this.subscribeToRoom=this.subscribeToRoom.bind(this);
      this.getRooms=this.getRooms.bind(this)
      
    }




  componentDidMount(){
    const chatManager=new Chatkit.ChatManager({
      instanceLocator,
      userId:'sandeep',
      tokenProvider:new Chatkit.TokenProvider({
        url:tokenUrl
      })
    })
    chatManager.connect()
    .then(currentUser=>{
      this.currentUser=currentUser;
      this.getRooms();
    })
    .catch(err=>console.log('error on connecting',err));
  }
  sendMessage(text){
    this.currentUser.sendMessage({
      text,
      roomId:this.state.roomId
    });
  
  }
getRooms(){
  this.currentUser.getJoinableRooms()
      .then(joinableRooms=>{
        this.setState({
          joinableRooms, 
          joinedRooms:this.currentUser.rooms
        })
      })
      .catch(err=>console.log('error on joinable Rooms',err))
      
}
  subscribeToRoom(roomId)
  {
    this.setState({messages:[]})
    this.currentUser.subscribeToRoom({
      roomId,
      hooks:{
        onNewMessage:message=>{
          console.log('messaege.text',message.text);
          this.setState({
            messages:[...this.state.messages,message]
          })
        }

      }
    })
    .then(room=>{
      this.setState({
        roomId:room.id
      })
      this.getRooms()
    })
    .catch(err=>console.log('errrrr'));
  }
  createRoom(name){
    this.currentUser.createRoom({
      name
    }).then(room=>this.subscribeToRoom(room.id))
  .catch(err=>console.log("error with create room"));
  }
  render() {
    return (
      <div className="app">
        <RoomList
        roomId={this.state.roomId}
        subscribeToRoom={this.subscribeToRoom} rooms={[...this.state.joinableRooms,...this.state.joinedRooms]}/>
        <MessageList
        roomId={this.state.roomId}
        messages={this.state.messages}/>
        <SendMessageForm
        disabled={!this.state.roomId}
        sendMessage={this.sendMessage}/>
        <NewRoomForm createRoom={this.createRoom}/>
        </div>
    );
  }
}
