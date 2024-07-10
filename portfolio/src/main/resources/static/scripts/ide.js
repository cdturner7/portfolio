/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/

const sections = [
    "git-section",
    "readme-section",
    "resume-section",
    "profile-section",
    "settings-section"
];

class IDE {

    constructor() {

        // make sure we know what is currently opened on the screen
        this.openedSection = null;

        // initalize the js tree with no data
        this.initializeJSTree();

        // setup button functionality
        this.buttonDetails = [
            {selector: '#file', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#edit', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#view', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#run', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#help', event: this.leftHeaderNavButtonHandler.bind(this)},

            {selector: '#toggle-primary-panel', event: this.togglePrimaryPanel.bind(this)},
            {selector: '#toggle-secondary-panel', event: this.rightHeaderNavButtonHandler.bind(this)},
            {selector: '#customize-layout', event: this.rightHeaderNavButtonHandler.bind(this)},
            {selector: '#code-cube', event: this.rightHeaderNavButtonHandler.bind(this)},

            {selector: '#home', event: this.homeButtonHandler.bind(this)},
            {selector: '#git', event: this.sidebarButtonHandler.bind(this)},
            {selector: '#resume', event: this.sidebarButtonHandler.bind(this)},
            {selector: '#settings', event: this.sidebarButtonHandler.bind(this)}
        ];
        // call the setup buttons function
        this.setupButtons();


        // primary panel resizable
        $(".resizable").resizable();
        //$('.ui-resizable-e').removeClass('ui-resizable-handle');
        //$('.ui-resizable-s').removeClass('ui-resizable-handle');

        // mini map details
        this.miniMap = [{
            isDragging: false,
            startY: 0,
            startTop: 0
        }];

        this.mainContent = $('#replaceable-content-container')[0];
        this.miniMapContent = $('#mini-map-content')[0];
        this.miniMapViewport = $('#mini-map-viewport')[0];

        // adding scrolling event listener
        //$('#replaceable-content-container').on('scroll', this.updateViewPort.bind(this));
        //$('#replaceable-content-container').on('mouseup', this.mouseUp.bind(this));
        //$('#replaceable-content-container').on('mousemove', this.mouseMove.bind(this));
        //$('#mini-map-viewport').on('mousedown', this.mouseDown.bind(this));

        // Lastly initialize by opening the home content
        this.openHomeContent();
    }

    setupButtons() {
        this.buttonDetails.forEach(button => {
            $(button.selector).on('click', (event) => button.event(event));
        });
    }

    // button click handlers
    homeButtonHandler(event) {
        event.preventDefault();
        this.openHomeContent();
    }

    openHomeContent() {
        if ($('#readme-section').hasClass('open')) {
            return;
        }
        // close opened section
        this.closeOpenedSection();
        // toggle the home page as needed
        this.open('readme-section');
    }

    leftHeaderNavButtonHandler(event) {
        event.preventDefault();
        let buttonId = $(event.target).attr('id');
        alert('Button clicked: ' + buttonId);
    }

    rightHeaderNavButtonHandler(event) {
        event.preventDefault();
        let buttonId = $(event.target).attr('id');
        alert('Button clicked: ' + buttonId);
    }

    sidebarButtonHandler(event) {
        event.preventDefault();
        let buttonID = $(event.target).attr('id') + '-section';
        let openedID = $('#main-editor-section').find('.open').attr('id');
        if (buttonID == openedID) {
            return;
        }
        // close opened section
        this.closeOpenedSection();
        // open the section clicked
        this.open(buttonID);
    }

    togglePrimaryPanel() {
        $("#primary-panel").toggleClass('open closed');
    }

    open(id) {
        if ($('#' + id).hasClass('closed')) {
            $('#' + id).toggleClass('open closed');
            $('#' + id + '-panel').toggleClass('open closed');
        }
        // set the openedSection
        this.setOpenedSection(id);
        // update the mini map
        this.updateMiniMap();
        // update the jstree primary panel contents
        this.jsTreeGetData();
    }

    close(id) {
        if ($('#' + id).hasClass('open')) {
            $('#' + id).toggleClass('open closed');
            $('#' + id + '-panel').toggleClass('open closed');
        }
    }

    closeOpenedSection() {
        let openedID = $('#main-editor-section').find('.open').attr('id');
        this.close(openedID);
    }

    setOpenedSection(section) {
        this.openedSection = section;
    }

    /* MINI MAP */
    updateMiniMap() {
        $('#mini-map-content').html(this.mainContent.innerHTML);
        this.updateViewPort();
    }

    // scroll event handler
    updateViewPort() {
        // get the main content details
        const contentHeight = this.mainContent.scrollHeight;
        const viewportHeight = this.mainContent.clientHeight;
        const scrollTop = this.mainContent.scrollTop;

        const miniMapHeight = this.miniMapContent.scrollHeight;
        const miniMapViewportHeight = viewportHeight * (miniMapHeight / contentHeight);
        const miniMapScrollTop = scrollTop * (miniMapHeight / contentHeight);

        this.miniMapViewport.style.height = `${miniMapViewportHeight}px`;
        this.miniMapViewport.style.top = `${miniMapScrollTop}px`;
    }

    // mouse click down event handler
    mouseDown(event) {
        event.preventDefault;
        this.miniMap.isDragging = true;
        this.miniMap.startY = event.clientY;
        this.miniMap.startTop = this.miniMapViewport.offsetTop;
        $('body').style.userSelect = 'none';
    }

    // mouse up event handler
    mouseUp(event) {
        event.preventDefault;
        this.miniMap.isDragging = false;
        $('body').style.userSelect = 'auto';
    }

    // mouse move event handler
    mouseMove(event) {
        event.preventDefault;
        if (this.miniMap.isDragging) {
            const deltaY = event.clientY - startY;
            const newTop = startTop + deltaY;
            const minimapHeight = this.miniMapContent.scrollHeight;
            const viewportHeight = this.mainContent.clientHeight;
            const contentHeight = this.mainContent.scrollHeight;

            const scrollRatio = contentHeight / minimapHeight;
            const newScrollTop = newTop * scrollRatio;

            this.miniMapViewport.style.top = `${newTop}px`;
            this.miniMapViewport.style.height = `${viewportHeight}px`;
            this.mainContent.scrollTop = newScrollTop;
        }
    }
    /* MINI MAP */

    /* JS TREE */
    jsTreeGetData() {
        $.ajax({
            url: 'http://localhost:8080/jstreedata/' + this.openedSection,
            type: 'GET',
            dataType: 'json',
            success: this.updateJSTree.bind(this),
            error: function(xhr, status, error) {
                // Handle any errors that occurred during the request
                console.error('Error:', error);
                $('#result').html('<p>An error occurred while fetching data.</p>');
            }
        });
    }

    initializeJSTree() {
        $('#primary-panel-jstree')
        // allow single click nodes
        .on('select_node.jstree', function(event, data) {
            event.preventDefault;
            if (data.event && data.node.a_attr.class.includes('folder-node')) {
                this.toggleNode(data.node);
            }
        }.bind(this))
        // create instance with no data
        .jstree({
            'core': {
                'data': []
            }
        });
    }

    updateJSTree(newData) {
        if (newData) {
            $('#primary-panel-jstree').jstree(true).settings.core.data = [newData];
            $('#primary-panel-jstree').jstree().refresh();
        }
    }

    toggleNode(node) {
        $('#primary-panel-jstree').jstree('toggle_node', node);
        $('#primary-panel-jstree').jstree('deselect_all', node);
    }

    /* JS TREE */

}

// Initialize the IDE class when the document is ready
$(document).ready(() => {
    new IDE();
});