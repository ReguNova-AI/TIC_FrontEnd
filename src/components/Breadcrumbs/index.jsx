import * as React from 'react';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import { Link as RouterLink, redirect,useNavigate } from 'react-router-dom';


export default function BreadcrumbsView(props) {
    const navigate = useNavigate();

    function handleClick(event) {
        //   event.preventDefault();
        // console.log("event",event)
        // navigate('/dashboard/default');
          console.info('You clicked a breadcrumb.');
        }
        
  return (
    <div role="presentation" onClick={handleClick} style={{margin:"0px 0px 20px 0px"}}>
      <Breadcrumbs aria-label="breadcrumb">
        <Link underline="hover" color="inherit" href="/">
          Dashboard
        </Link>
        {props.previousLink ? 
        <Link
          underline="hover"
          color="inherit"
          aria-current="page"
          href={props.previousLink }
        >
         {props.previousPage}
        </Link>
      
        : ""}
        <Link
        //   underline="hover"
          color="inherit"
          aria-current="page"
        >
         <span style={{color:"black",fontWeight:600}}>{props.currentPage}</span>
        </Link>
      
      </Breadcrumbs>
    </div>
  );
}
