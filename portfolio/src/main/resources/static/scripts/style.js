/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/

class Base {

    constructor() {
        // load custom canvas spinner
        this.preloader();
    }

    /* preloader and loading page overlay management */
    preloader() {
        let preloaderID = '#preloader';
        let preloaderTitleID = '#preloader-title';
        // show the preloader section and animation
        $(preloaderID).show();
        gsap.fromTo(preloaderID, 
            { 
                opacity: 1 
            },
            {
                opacity: 0,
                display: "none",
                duration: 1,
                delay: 3,
            }
        );
        gsap.fromTo(
            preloaderTitleID,
            {
                y: 50,
                opacity: 0,
            },
            {
                y: 0,
                opacity: 1,
                duration: 2,
                delay: 1,
            }
        );
    }
    /* end preloader and loading page overall management */
}

// Initialize the Base class when the document is ready
$(document).ready(() => {
    new Base();
});