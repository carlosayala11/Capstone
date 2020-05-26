import React, {Component} from 'react';
import {Button, Input, Label, FormGroup, Form} from 'reactstrap';
import { withRouter } from 'react-router-dom';
import Flatpickr from "react-flatpickr";
import "flatpickr/dist/themes/material_blue.css";
import axios from 'axios'
import moment from 'moment'

var firebase = require('firebase');

class UpdateAppointmentForm extends Component{
    constructor(){
        super();
        this.state={
            date: '',
            duration:'',
            completed:'',
            pending:'',
            canceled:'',
            endDate:'',
            start:'',
            end:''
        };
    }


    getHours = () =>{
        var id = sessionStorage.getItem('sid');
        console.log(id);
        axios.get('http://127.0.0.1:5000/services/hours',{
            params: {
                id: id
            }
        })
      .then(res => {
          console.log(res.data)
        this.setState({
          start: res.data.Service.starttime
        });
        this.setState({
          end: res.data.Service.endtime
        });
      });
    }
    onInputChange = (event) => {
        event.preventDefault();
        console.log(event.target.value);
        this.setState({
            [event.target.name]: event.target.value
        })
    }
    componentDidMount(){
        this.getHours();

      }

    onSubmit = (event) => {
        event.preventDefault();
        var aid = sessionStorage.getItem('aid');
        console.log(aid);
        console.log(moment(this.state.start,'HH:mm'));
        console.log(moment(this.state.end,'HH:mm'));
        var id = firebase.auth().currentUser.uid;
        const startTime = this.state.dt;
        const durationInMinutes = this.state.duration;
        const endTime = moment(startTime, 'YYYY-MM-DDTHH:mm').add(durationInMinutes, 'minutes').format('YYYY-MM-DDTHH:mm');
        console.log(moment(startTime,'HH:mm'));
        console.log(moment(endTime,'HH:mm'));
        if(moment(startTime,'HH:mm') < moment(this.state.start,'HH:mm')){
            this.setState({errorMessage: 'Invalid Start Time: Earlier than allowed'})}
        if(moment(startTime,'HH:mm') > moment(this.state.end,'HH:mm')){
            this.setState({errorMessage: 'Invalid Start Time: Later than allowed'})}
        if(moment(endTime,'HH:mm') < moment(this.state.start,'HH:mm')){
            this.setState({errorMessage: 'Invalid End Time: Earlier than allowed'})}
        if(moment(endTime,'HH:mm') > moment(this.state.end,'HH:mm')){
            this.setState({errorMessage: 'Invalid End Time: Later than allowed'})}

        //this.setState({endDate:endTime})
        console.log("Start time: " + startTime)
        console.log("End Time:" + endTime)
        var appointment = {
                   aid: aid,
                   pending: true,
                   completed: false,
                   canceled: false,
                   duration: durationInMinutes,
                   startDate: startTime,
                   endDate: endTime
                }

                console.log(appointment)
        axios.put('http://127.0.0.1:5000/appointment/update', appointment).then((res)=>{
                 console.log(res)
                }).catch((error) => {
                this.setState({errorMessage: error.message})
                this.setState({errorCode: error.code})
        });
        sessionStorage.clear();
        this.props.history.push('/home');
    }
    renderErrorMessage(){
        if(this.state.errorMessage){
            console.log(this.state.errorMessage)
            return <p className="login-error-message">{this.state.errorMessage}</p>}

        }
    render(){
        const {date, duration, bname, serviceType } = this.state;
        var dt;
        return(
            <div className="form-container">
                <form>
                    <Label>Date</Label>
                    <div>
                    <Flatpickr
                        data-enable-time
                        placeholder="Please select a date"
                        name="date"
                        value={date}
                        onChange={date => {
                            dt = moment(date[0]).format('YYYY-MM-DDTHH:mm');
                            // console.log(dt)
                            this.setState({ dt });
                          }}
                    />
                    </div>
                <FormGroup>
                    <Label for="duration">Duration (in minutes)</Label>
                    <Input name="duration" type="select" value={this.state.duration} onChange={this.onInputChange}>
                        <option>10</option>
                        <option>20</option>
                        <option>30</option>
                        <option>40</option>
                        <option>50</option>
                    </Input>
                </FormGroup>
                </form>
                <Button className="appointment-button" color="primary" onClick={this.onSubmit.bind(this)}>Schedule</Button>{' '}
                {this.renderErrorMessage()}
            </div>


        )
    }

}

export default withRouter(UpdateAppointmentForm);