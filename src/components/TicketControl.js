import React, { useEffect, useState } from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import db from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

const TicketControl = () => {
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      // new code!
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  const handleDeletingTicket = (id) => {
    const newMainTicketList = mainTicketList.filter(ticket => ticket.id !== id);
    setMainTicketList(newMainTicketList);
    // new code!
    setSelectedTicket(null);
  }

  const handleEditClick = () => {
    // new code!
    setEditing(true);
  }

  const handleEditingTicketInList = (ticketToEdit) => {
    const editedMainTicketList = mainTicketList
    // new code: selectedTicket.id
    .filter(ticket => ticket.id !== selectedTicket.id)
    .concat(ticketToEdit);
    setMainTicketList(editedMainTicketList);
    // new code!
    setEditing(false);
    setSelectedTicket(null);
  }

  const handleAddingNewTicketToList = async (newTicketData) => {
    // await the addDoc function to return a promise
    await addDoc(collection(db, "tickets"), newTicketData);
    setFormVisibleOnPage(false);
  }

  const handleChangingSelectedTicket = (id) => {

    const selection = mainTicketList.filter(ticket => ticket.id === id)[0];
    setSelectedTicket(selection);
  }


  let currentlyVisibleState = null;
  let buttonText = null; 


  if (editing) {      
    currentlyVisibleState = 
      <EditTicketForm 
        ticket = {selectedTicket} 
        onEditTicket = {handleEditingTicketInList} />;
    buttonText = "Return to Ticket List";
  } else if (selectedTicket != null) {
    currentlyVisibleState = 
      <TicketDetail 
        ticket={selectedTicket} 
        onClickingDelete={handleDeletingTicket}
        onClickingEdit = {handleEditClick} />;
    buttonText = "Return to Ticket List";
  } else if (formVisibleOnPage) {
    currentlyVisibleState = 
      <NewTicketForm 
        onNewTicketCreation={handleAddingNewTicketToList}/>;
    buttonText = "Return to Ticket List"; 
  } else {
    currentlyVisibleState = 
      <TicketList 
        onTicketSelection={handleChangingSelectedTicket} 
        ticketList={mainTicketList} />;
    buttonText = "Add Ticket"; 
  }

  return (
    <React.Fragment>
      {currentlyVisibleState}
      <button onClick={handleClick}>{buttonText}</button> 
    </React.Fragment>
  );
}

export default TicketControl;

