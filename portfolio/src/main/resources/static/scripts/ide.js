/*
 *******************************************************************************
 * Project: Portfolio Website
 *
 * Author: Collin Turner
 * =============================================================================
 * (c) Copyright 2024 CollinDTurner All rights reserved.
 *******************************************************************************
*/

class IDE {

    constructor() {
        // load custom canvas spinner
        //this.preloader();

        // make sure we know what is currently opened on the screen
        this.openedSection = null;

        // create list to hold tabs
        this.tabs = [];

        // initalize the js tree with no data
        this.initializeJSTree();

        // set up all the sections
        this.sectionDetails = [
            {id: 'git',      section: "git-section",      title: "Git",      tabID: 'git-tab'},
            {id: 'readme',   section: "readme-section",   title: "README",   tabID: 'readme-tab'},
            {id: 'resume',   section: "resume-section",   title: "Resume",   tabID: 'resume-tab'},
            {id: 'profile',  section: "profile-section",  title: "Profile",  tabID: 'profile-tab'},
            {id: 'settings', section: "settings-section", title: "Settings", tabID: 'settings-tab'}
        ];

        // setup button functionality
        this.buttonDetails = [
            // left header navbar
            {selector: '#file', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#edit', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#view', event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#run',  event: this.leftHeaderNavButtonHandler.bind(this)},
            {selector: '#help', event: this.leftHeaderNavButtonHandler.bind(this)},
            // right header navbar
            {selector: '#code-cube',              event: this.rightHeaderNavButtonHandler.bind(this)},
            {selector: '#customize-layout',       event: this.rightHeaderNavButtonHandler.bind(this)},
            {selector: '#toggle-primary-panel',   event: this.togglePrimaryPanel.bind(this)},
            {selector: '#toggle-secondary-panel', event: this.rightHeaderNavButtonHandler.bind(this)},
            // sidebar
            {selector: '#git',      event: this.sidebarButtonHandler.bind(this)},
            {selector: '#readme',   event: this.sidebarButtonHandler.bind(this)},
            {selector: '#resume',   event: this.sidebarButtonHandler.bind(this)},
            {selector: '#profile',  event: this.sidebarAnchorHandler.bind(this)},
            {selector: '#settings', event: this.sidebarButtonHandler.bind(this)}
        ];
        // call the setup buttons function
        this.setupButtons();

        // setup tabs and functionality
        this.tabDetails = [
            {selector: '#git-tab',      event: this.tabSelect.bind(this)},
            {selector: '#readme-tab',   event: this.tabSelect.bind(this)},
            {selector: '#resume-tab',   event: this.tabSelect.bind(this)},
            {selector: '#profile-tab',  event: this.tabSelect.bind(this)},
            {selector: '#settings-tab', event: this.tabSelect.bind(this)}
        ];

        // primary panel resizable
        $(".resizableX").resizable({
            handles: 'e, w'
        });

        $(".resizableY").resizable({
            handles: 'n, s'
        });

        // mini map details
        this.miniMap = [{
            isDragging: false,
            startY: 0,
            startTop: 0
        }];

        this.mainContent = $('#replaceable-content-container')[0];
        this.miniMapContent = $('#mini-map-content')[0];
        this.miniMapViewport = $('#mini-map-viewport')[0];

        // adding scrolling event listener for main content and mini map
        this.isDragging = 'false';
        $('#replaceable-content-container').on('scroll', this.updateViewPort.bind(this));
        $('#mini-map-viewport').draggable(
            {axis: "y" }, 
            {drag: this.scrollContent.bind(this)},
            {containment: this.miniMapContent}
        );

        $('#profile-card-resume-button').on('click', function() {
            this.createTab('resume-section');
        }.bind(this));

        // Lastly initialize by opening the home/readme content
        this.createTab('readme-section');
    }

    setupButtons() {
        this.buttonDetails.forEach(button => {
            $(button.selector).on('click', (event) => button.event(event));
        });
    }

    getSection(section) {
        let sectionDetails = null;
        this.sectionDetails.forEach(sectionInfo => {
            if (sectionInfo.section == section) {
                sectionDetails = sectionInfo;
            }
        });
        return sectionDetails;
    }

    getSectionByTabID(tabID) {
        let sectionDetails = null;
        this.sectionDetails.forEach(sectionInfo => {
            if (sectionInfo.tabID == tabID) {
                sectionDetails = sectionInfo;
            }
        });
        return sectionDetails;
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

    sidebarAnchorHandler(event) {
        // anchor tags target in event is the child node, 
        // update the target in the event with the parent node
        // then call sideBarButtonHandler
        event.target = event.target.parentElement;
        this.sidebarButtonHandler(event);
    }

    sidebarButtonHandler(event) {
        event.preventDefault();
        let buttonID = $(event.target).attr('id') + '-section';
        // get the opened section
        let openedSection = this.openedSection;
        if (openedSection && (buttonID == openedSection)) {
            return;
        }
        // create the tab
        this.createTab(buttonID);
    }

    togglePrimaryPanel() {
        $("#primary-panel").toggleClass('open');
        $("#primary-panel").toggleClass('closed');
    }

    closeAndOpen(id) {
        // close opened section
        this.closeOpenedSection();
        // open the section passed in
        this.open(id);
    }

    open(id) {
        if ($('#' + id).hasClass('closed')) {
            this.closeOrOpen(id);
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
            this.closeOrOpen(id);
        }
    }

    closeOrOpen(id) {
        $('#' + id).toggleClass('open');
        $('#' + id).toggleClass('closed');
        $('#' + id + '-panel').toggleClass('open');
        $('#' + id + '-panel').toggleClass('closed');
    }

    closeOpenedSection() {
        // check if something is currently opened
        if (this.openedSection) {
            // close opened section
            this.close(this.openedSection);
        }
    }

    setOpenedSection(section) {
        this.openedSection = section;
    }

    /* MINI MAP */
    updateMiniMap() {
        this.miniMapContent.innerHTML= this.mainContent.innerHTML;
        // remove ids of mini map content just in case of crossing webs
        $('#mini-map-content div').removeAttr('id');
        this.updateViewPort(null);
    }

    // scroll event handler for updating the 
    // viewport when scrolling main content
    updateViewPort() {
        if (this.isDragging == 'true') {
            this.isDragging = 'false';
            return;
        }
        // get the main content details
        const contentHeight = this.mainContent.scrollHeight;
        let viewportHeight = this.mainContent.clientHeight;
        const scrollTop = this.mainContent.scrollTop;
        // get the viewport percentage
        const viewportPercentage = viewportHeight / contentHeight;
        if (viewportHeight > 1) {
            viewportHeight = 1;
        }
        // update the mini map content height
        const miniMapContentHeight = contentHeight * 0.13;
        $('#mini-map-content').css('height', miniMapContentHeight + 'px');
        // get the mini map veiwport height and set scrollTop
        const miniMapViewportHeight =  miniMapContentHeight * viewportPercentage;
        const miniMapScrollTop = scrollTop * 0.13;
        // set the view port height and top based on the main content shown
        this.miniMapViewport.style.height = `${miniMapViewportHeight}px`;
        this.miniMapViewport.style.top = `${miniMapScrollTop}px`;
    }

    scrollContent() {
        this.isDragging = 'true';
        let miniMapScrollTop = this.miniMapViewport.offsetTop / 0.13;
        this.mainContent.scrollTop = miniMapScrollTop;
    }
    /* MINI MAP */

    /* JS TREE */
    jsTreeGetData() {
        // just clear the tree if we dont have opened section
        if (!this.openedSection) {
            clearJSTree();
            return;
        }
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

    clearJSTree() {
        this.updateJSTree($.noop);
    }

    toggleNode(node) {
        $('#primary-panel-jstree').jstree('toggle_node', node);
        $('#primary-panel-jstree').jstree('deselect_all', node);
    }
    /* end JS TREE */

    /* tab management */
    createTab(section) {
        // get the section from the sections object to create the button with
        let sectionData = this.getSection(section);
        if (this.sectionTabExists(sectionData)) {
            // open the tab if its not open already
            this.closeAndOpen(sectionData.section);
            this.setActiveTab(sectionData.tabID);
            return;
        }
        // remove the active tab
        $('.tab-links.active').removeClass('active');
        // create the new tab and set to active
        $('#tabsSection')
            .append('<Button id=' + sectionData.tabID + ' class="tab-links active">' + sectionData.title + 
                '<span class="tab-close material-symbols-rounded">close</span></Button>');
        // add button functionality
        $('#' + sectionData.tabID).on('click', this.tabSelect.bind(this));
        // add tab close functionality
        $('.tab-close').on('click', this.closeTab.bind(this));
        // check if we need to then open the section
        this.closeAndOpen(sectionData.section);
        // lastly add the tab to the js list of tabs
        this.tabs.push(sectionData);
    }

    sectionTabExists(sectionData) {
        if (this.tabs.length > 0) {
            return this.tabs.indexOf(sectionData) != -1;
        }
    }

    // a few things happen when we close tab, 
    // close the tab,
    // remove the tab from the list of tabs,
    // close the section of that tab if its open,
    // if we closed the tab of an opened section, open closest tab
    closeTab(event) {
        event.preventDefault;
        let closeTab = $(event.target).parent();
        // get the sectiondata from the tab
        let sectionData = this.getSectionByTabID(closeTab[0].id);
        // find the index of the tab
        let indexOfCloseTab = this.tabs.indexOf(sectionData);
        // remove the tab
        $(closeTab).remove();
        // remove the tab from the list of tabs        
        this.removeTabFromList(sectionData);
        // close the section
        this.close(sectionData.section);
        if (this.tabs.length == 0) {
            // reset the opened section
            this.openedSection = "";
            // clear the minimap
            this.updateMiniMap();
            // clear js tree
            this.clearJSTree();
        }
        if (this.openedSection == sectionData.section) {
            // open the next closest tab
            this.openClosestTab(indexOfCloseTab);
        }
    }

    setActiveTab(tabID) {
        let activeTab = $('.tab-links.active')[0];
        if (activeTab && (tabID == activeTab.id)) {
            return;
        }
        $(activeTab).removeClass('active');
        $('#' + tabID).addClass('active');
    }

    tabSelect(event) {
        event.preventDefault;
        // get selected tabs id
        let tabSelectedID = event.target.id;
        // set it as the active tab
        this.setActiveTab(tabSelectedID);
        // get the section to open it
        let sectionData = this.getSectionByTabID(tabSelectedID);
        this.closeAndOpen(sectionData.section);
    }

    removeTabFromList(tab) {
        let indexOfCloseTab = this.tabs.indexOf(tab);
        if (indexOfCloseTab == -1) {
            return;
        }
        // splice or remove the indexed tab
        this.tabs.splice(indexOfCloseTab, 1);
    }

    openClosestTab(indexOfCloseTab) {
        let openTab = null;
        let openTabCount = this.tabs.length;
        if (openTabCount == 0) {
            return;
        } else if (openTabCount == 1) {
            openTab = this.tabs[0];
            this.open(openTab.section);
        } else {
            // if last index add one because we remove one 
            // to get the left tab in the list
            if (indexOfCloseTab == 0) {
                indexOfCloseTab++;
            }
            // get previous index
            openTab = this.tabs[--indexOfCloseTab];
            this.closeAndOpen(openTab.section);
        }
        // finally set the new active tab
        this.setActiveTab(openTab.tabID);
    }
    /* end tab management */

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

// Initialize the IDE class when the document is ready
$(document).ready(() => {
    new IDE();
});