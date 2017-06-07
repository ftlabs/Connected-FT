/*globals document navigator window localStorage Notification*/
const __connected_ft = (function(){

	'use strict';
	let appSubscription = undefined;

	let resetTaps = 0;

	const existingCards = JSON.parse( localStorage.getItem('cards') ) || [];

	const elements = {
		subscribeForm : document.querySelector('form#registerDevice'),
		triggerBtn : document.querySelector('button.triggerBtn'),
		stream : document.querySelector('.stream'),
		titleBar : document.querySelector('header'),
		overlay : document.querySelector('#overlay'),
		noitems : document.querySelector('p.noitems'),
		login : document.querySelector('.login'),
		menu : document.querySelector('.component#menu'),
		drawer : document.querySelector('.component#drawer'),
		secretUnsubscribe : document.querySelector('#secretUnsub'),
		visibleUnsubscribe : document.querySelector('#visibleUnsub')
	};
	
	function zeroPad(n){

		if(n < 10){
			return '0' + n;
		} else {
			return n;
		}

	}

	const overlay = (function(){

		const overlayElement = elements.overlay;

		function setOverlayMessage(title, message, buttonText){
			
			if(title){
				overlayElement.querySelector('h3').textContent = title;
			}

			if(message){
				overlayElement.querySelector('p').textContent = message;
			}

			if(buttonText){
				overlayElement.querySelector('button').textContent = buttonText;
			}

		}
		
		function showOverlay(){
			overlayElement.dataset.visible = 'true';
		}

		function hideOverlay(){
			overlayElement.dataset.visible = 'false';
		}

		overlayElement.querySelector('button').addEventListener('click', hideOverlay, false);

		return {
			set : setOverlayMessage,
			show : showOverlay,
			hide : hideOverlay
		};

	}());

	const loading = (function(){

		const spinningPanel = document.querySelector('#loading');

		function makeItSpin(){
			spinningPanel.dataset.visible = 'true';
		}

		function itSpinsTooMuchSTAHP(){
			spinningPanel.dataset.visible = 'false';
		}

		return {
			show : makeItSpin,
			hide : itSpinsTooMuchSTAHP
		}

	}());

	function createCard(data, animate){

		if(animate === undefined || animate === null){
			animate = true;
		}

		const time = data.senttime === undefined ? new Date() : new Date(data.senttime * 1000);

		const docFrag = document.createDocumentFragment();
		
		const itemContainer = document.createElement('div');
		const timeReceieved = document.createElement('span');
		const contentContainer = document.createElement('div');

		itemContainer.classList.add('streamitem');
		timeReceieved.classList.add('timeReceived');
		contentContainer.classList.add('content');

		if(animate){
			itemContainer.dataset.collapsed = "true";
		}

		timeReceieved.textContent = zeroPad( time.getHours() ) + ":" + zeroPad( time.getMinutes() );
		itemContainer.appendChild(timeReceieved);

		const headline = document.createElement('strong');
		const byline = document.createElement('span');
		const image = document.createElement('img');
		const link = document.createElement('a');

		headline.textContent = data.headline;
		byline.textContent = data.byline;
		image.src = data.imagesrc;
		link.href = data.url;
		link.target = '_blank';
		link.textContent = 'Read now';

		contentContainer.appendChild(headline);
		contentContainer.appendChild(byline);
		
		if(data.imagesrc !== undefined){
			contentContainer.appendChild(image);
		}

		contentContainer.appendChild(link);
		itemContainer.appendChild(contentContainer);

		docFrag.appendChild(itemContainer);

		return docFrag;

	}

	function registerDevice(subscription, name, type){

		subscription = subscription || appSubscription;

		return fetch('/devices/register', {
				method : 'POST',
				headers : {
					'Content-Type' : 'application/json'
				},
				credentials : 'include',
				body : JSON.stringify({
					subscription : subscription,
					name : name,
					type : type
				})
			})
			.then(res => {
				if(!res.ok){
					throw res
				} else {
					return res.json();
				}
			})
			.catch(err => {
				console.log('Registration error', err);
			})
		;

	}

	function subscribe() {

		return new Promise( (resolve, reject) => {
			
			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

				serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true})
					.then(function(subscription) {
						appSubscription = subscription;
						resolve(subscription);
					})
					.catch(function(err) {
						if (Notification.permission === 'denied') {
							reject('denied');
						} else {
							reject(err);
							
						}
					})
				;

			});

		});

	}

	function unsubscribe() {

		return new Promise( (resolve, reject) => {

			navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) {
				// To unsubscribe from push messaging, you need get the
				// subcription object, which you can call unsubscribe() on.
				serviceWorkerRegistration.pushManager.getSubscription().then(
				function(pushSubscription) {
					// We have a subcription, so call unsubscribe on it
					pushSubscription.unsubscribe()
						.then(function() {
							console.log('Unsubscribed');
							resolve();
						})
						.catch(function(e) {
							console.log('Unsubscription error: ', e);
							reject(e);
						})
					;
				})
	
			});

		});
	}

	function deleteDevice(deviceID){

		return fetch(`/devices/unregister/${deviceID}`, {method : 'DELETE', credentials : 'include'})
			.then(res => {
				if(res.ok){
					return res.json();
				} else {
					throw res;
				}
			})
			.then(result => {
				console.log(result);
			})
		;
	}

	function addCard(data, animate){

		if(animate === undefined || animate === null){
			animate = true;
		}

		var newCard = createCard(data, animate);

		elements.stream.insertBefore(newCard, elements.stream.querySelectorAll('.streamitem')[0]);
		
		elements.noitems.dataset.visible = 'false';

		if(animate){

			setTimeout(function(){
				document.querySelectorAll('.streamitem')[0].dataset.collapsed = 'false';
			}, 50);

		}

	}

	function whoami(){

		return fetch('/devices/whoami', {
				credentials : 'include',
				method : 'POST',
				body : JSON.stringify({subscription : appSubscription}),
				headers : {
					'Content-Type' : 'application/json'
				}
			})
			.then(res => {
				if(res.ok){
					return res.json();
				} else {
					throw res;
				}
			})
			.then(data => {
				return data.deviceid;
			})
			.catch(err => {
				if(err.status === 404){
					unsubscribe().then(() => handleUnsubscribe());
				} else {
					throw err;
				}
			})
		;

	}

	function getTimelineHistory(){

		return fetch('/timeline/me', { credentials : 'include' })
			.then(res => {
				if(res.ok){
					return res.json();
				} else {
					throw res;
				}
			})
		;

	}

	function populateDrawerWithDevices(thisDeviceID){

		return fetch('/devices/list', {
				credentials : 'include'
			})
			.then(res => {
				if(res.ok){
					return res.json();
				} else {
					throw res;
				}
			})
			.then(data => {

				console.log(data);

				const existingDevicesList = elements.drawer.querySelector('section.deviceslist');

				if(existingDevicesList !== null){
					existingDevicesList.parentNode.removeChild(existingDevicesList);
				}

				const drawerDevicesDocFrag = document.createDocumentFragment();
				
				const section = document.createElement('section');
				const title = document.createElement('div');
				const ol = document.createElement('ol');
				
				section.classList.add('deviceslist');
				title.classList.add('title');

				title.textContent = 'My Connected Devices';
				
				section.appendChild(title);	
				
				data.devices.forEach(device => {

					const li = document.createElement('li');
					const a = document.createElement('a');
					const span = document.createElement('span');

					const spanA = document.createElement('a');

					a.textContent = `${device.name} ${device.deviceid === thisDeviceID ? '(this device)' : `(${device.type})`} `;
					spanA.textContent = 'deregister';
					spanA.dataset.visible = 'true';

					span.innerHTML = `<div data-visible="false" class="o-loading o-loading--dark o-loading--small o-loading--smaller"></div>`;
					span.appendChild(spanA);

					span.addEventListener('click', function(){
						console.log('DEREG');

						spanA.dataset.visible = 'false';
						span.querySelector('.o-loading').dataset.visible = 'true';

						deleteDevice(device.deviceid)
							.then(result => {
								console.log(result);
								li.parentElement.removeChild(li);
								elements.drawer.dataset.opened = 'false';
								if(device.deviceid === thisDeviceID){
									unsubscribe().then(() => handleUnsubscribe());
								}
							})
						;
					});

					li.appendChild(a);
					li.appendChild(span);

					ol.appendChild(li);

				});

				section.appendChild(ol);
				drawerDevicesDocFrag.appendChild(section);

				// elements.drawer.insertBefore(document.querySelector('.settings'), drawerDevicesDocFrag);

				elements.drawer.insertBefore(drawerDevicesDocFrag, document.querySelector('.settings'));

			})
			.catch(err => {
				console.log(err);
			})
		;

	}

	function prepareUI(){

		return new Promise( (resolve, reject) => {

			whoami()
				.then(deviceid => {
					setInterval(function(){
						populateDrawerWithDevices(deviceid)
					}.bind(this), 10000);
					return populateDrawerWithDevices(deviceid);
				})
				.then(function(){
					elements.menu.dataset.visible = 'true';
					elements.subscribeForm.dataset.visible = false;
					// elements.stream.dataset.visible = true;
					resolve();
				})
				.catch(err => {
					console.log('Error preparing the UI', err);
					reject(err);
				})
			;

		});

	}

	function fillStreamWithItems(timelineItems){

		console.log(timelineItems);
		elements.stream.innerHTML = '';
		timelineItems.items.reverse().forEach(item => addCard(item, false, false));
		elements.stream.dataset.visible = 'true';
		loading.hide();

	}

	function handleUnsubscribe(){
		elements.subscribeForm.dataset.visible = 'true';
		localStorage.clear();
		window.location.reload();
	}

	function bindEvents(){

		elements.subscribeForm.addEventListener('submit', function(e){
			e.preventDefault();

			const deviceName = this.querySelector('input[name="devicename"]').value
			const deviceType = this.querySelector('select[name="devicetype"]').value;
	
			subscribe()
				.then(subscription => {
					loading.show();
					registerDevice(subscription, deviceName, deviceType)
						.then(response => {
							console.log('Subscription response', response);
							prepareUI()
								.then(function(){
									
									elements.subscribeForm.dataset.visible = 'false';									
									elements.stream.dataset.visible = 'true';
									loading.hide();

									getTimelineHistory()
										.then(data => fillStreamWithItems(data))
										.catch(err => {
											console.log('An error occurred retrieving the users timeline', err);
										})
									;

								})
							;
						})
					;

				})
				.catch(err => {

					if(err === 'denied'){
						// The user denied the notification permission which
						// means we failed to subscribe and the user will need
						// to manually change the notification permission to
						// subscribe to push messages
						console.log('Permission for Notifications was denied');
						overlay.set('Push notifications denied', 'For Connected FT to work, you must enable push notifications for this web page on this device', 'OK');
						overlay.show();
						elements.subscribeForm.dataset.visible = true;
					} else {
						// A problem occurred with the subscription, this can
						// often be down to an issue or lack of the gcm_sender_id
						// and / or gcm_user_visible_only
						console.log('Unable to subscribe to push.', e);
						overlay.set('Push notifications error', 'Sorry, but an unknown error has occurred.', 'OK');
						overlay.show();
						elements.subscribeForm.dataset.visible = true;
					}

				})
			;
		}, false);

		elements.secretUnsubscribe.addEventListener('click', function(){

			if(resetTaps === 2){
				unsubscribe()
					.then(() => handleUnsubscribe())
					.catch(err => {
						console.log('Failure in unsubscribing device.', err);
						overlay.set('Push notifications error', 'Sorry, but an unknown error has occurred while we tried to unsubscribe this device.', 'OK');
						overlay.show();
						elements.subscribeForm.dataset.visible = true;
					})
				;
				resetTaps = 0;
				this.textContent = '';
			} else if(resetTaps === 1){

				resetTaps += 1;
				this.textContent = '1 more';
			
			} else {
				resetTaps += 1;
			}

		}, false);

		elements.visibleUnsubscribe.addEventListener('click', function(){

			unsubscribe()
				.then( () => handleUnsubscribe() )
				.catch(err => {
					console.log('Failure in unsubscribing device.', err);
					overlay.set('Push notifications error', 'Sorry, but an unknown error has occurred while we tried to unsubscribe this device.', 'OK');
					overlay.show();
					elements.subscribeForm.dataset.visible = true;
				})
			;

		}, false);

		elements.menu.addEventListener('click', function(){

			if(elements.drawer.dataset.opened === 'false'){
				elements.drawer.dataset.opened = 'true';
			} else {
				elements.drawer.dataset.opened = 'false';
			}

		}, false);

		navigator.serviceWorker.addEventListener('message', function(event){
			console.log("Client 1 Received Message: " + event.data);

			/*var newCard = createCard({
				headline : 'Euro and French stocks surge on expectation Macron beats Le Pen',
				byline : "Centrist’s likely success in head-to-head for French presidency eases investor nerves",
				imagesrc : "https://www.ft.com/__origami/service/image/v2/images/raw/http%3A%2F%2Fprod-upp-image-read.ft.com%2F5d033616-2856-11e7-bc4b-5528796fe35c?source=next&fit=scale-down&compression=best&width=750",
				url : 'https://www.ft.com/content/14b558da-284c-11e7-bc4b-5528796fe35c'
			});*/

			const data = JSON.parse(event.data);

			addCard(data);

		});

	}

	function checkLoginStatus(){

		return fetch('/isloggedin', {
				credentials : 'include'
			})
			.then(function(res){
				if(res.status !== 200){
					throw res.status;
				} else {
					return res.json();
				}
			})

	}

	function initialise(){

		loading.show();

		bindEvents();

		checkLoginStatus()		
			.then(function(){
				elements.login.dataset.visible = "false";
				loading.hide();
				navigator.serviceWorker.ready.then(function(serviceWorkerRegistration) { 

					serviceWorkerRegistration.pushManager.getSubscription()
						.then(function(pushSubscription){
							
							console.log(pushSubscription);

							if(!pushSubscription){
								console.log("We're not subscribed to push notifications");
								elements.subscribeForm.dataset.visible = 'true';
								elements.stream.dataset.visible = 'false';
							} else {
								
								console.log("We're subscribed for push notifications");
								appSubscription = pushSubscription;
								
								loading.show();
								
								prepareUI()
									.then(function(){
										elements.subscribeForm.dataset.visible = 'false';									

										getTimelineHistory()
											.then(data => fillStreamWithItems(data))
											.catch(err => {
												console.log('An error occurred retrieving the users timeline', err);
											})
										;

									})
								;
	
							
							}

						})
					;
					
				});

			})
			.catch(err => {
				console.log(err);
				switch(err){
					case 401:
						elements.login.dataset.visible = 'true';
						loading.hide();
						break;
					default:
						console.log('UNKNOWN LOGIN ERROR', err);
						break;
				}
			})
		;

	}

	return {
		init : initialise
	};

}());


