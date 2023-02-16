import React, { useEffect, useState } from 'react';
import NewTicketForm from './NewTicketForm';
import TicketList from './TicketList';
import EditTicketForm from './EditTicketForm';
import TicketDetail from './TicketDetail';
import db from '../firebase';
import { collection, addDoc, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';

const TicketControl = () => {
  const [formVisibleOnPage, setFormVisibleOnPage] = useState(false);
  const [mainTicketList, setMainTicketList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unSubscribe = onSnapshot(collection(db, "tickets"),
    (collectionSnapshot) => {
      // create an empty array to hold the tickets
      const tickets = [];
      // loop through collection object of returned ticket documents, for each document, push an object /w ticket properties into the tickets array
      collectionSnapshot.forEach(doc => {
        tickets.push({
          // b/c doc.data() returns all of our documents data into an object, we can use the spread operator to spread all of the 
          ...doc.data(),
          id: doc.id
        });
      })
      // set the mainTicketList state to the tickets array
      setMainTicketList(tickets);
    },
    (error) => {
      setError(error.message);
    });

    return () => unSubscribe();
  }, []);

  const handleClick = () => {
    if (selectedTicket != null) {
      setFormVisibleOnPage(false);
      setSelectedTicket(null);
      setEditing(false);
    } else {
      setFormVisibleOnPage(!formVisibleOnPage);
    }
  }

  const handleDeletingTicket = async (id) => {
    await deleteDoc(doc(db, "tickets", id));
    setSelectedTicket(null);
  }

  const handleEditClick = () => {
    setEditing(true);
  }

  const handleEditingTicketInList = async (ticketToEdit) => {
    // create a reference using doc() and the ticket id that is passed in
    const ticketRef = doc(db, "tickets", ticketToEdit.id);
    // await the updateDoc function that will use the ticketRef and update it in the database with the ticketToEdit object 
    await updateDoc(ticketRef, ticketToEdit)
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


  if (error) {
    currentlyVisibleState = <p>There was an error: {error}</p>
  } else if (editing) {      
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
      {/* ternary operator, if error true, return null, else return <button> */}
      {error ? null : <button onClick={handleClick}>{buttonText}</button>} 
    </React.Fragment>
  );
}

export default TicketControl;

