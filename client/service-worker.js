/* global self clients MessageChannel*/
'use strict';

function send_message_to_client(client, msg){
    return new Promise(function(resolve, reject){
        var msg_chan = new MessageChannel();

        msg_chan.port1.onmessage = function(event){
            if(event.data.error){
                reject(event.data.error);
            }else{
                resolve(event.data);
            }
        };

        client.postMessage(msg, [msg_chan.port2]);
    });
}

function send_message_to_all_clients(msg){
    clients.matchAll().then(clients => {
        clients.forEach(client => {
            send_message_to_client(client, msg).then(m => console.log("SW Received Message: "+m));
        })
    })
}

self.addEventListener('push', function(event) {
  console.log('Received a push message', event);

  var data = event.data.json();

  var title = 'Connected FT';
  var body = data.headline;
  var icon = '/images/ftlogo.png';
  var tag = data.url;

  console.log(event.data.json())

  event.waitUntil(
    self.registration.showNotification(title, {
      body: body,
      icon: icon,
	  tag : tag || undefined
    })
  );

  send_message_to_all_clients(JSON.stringify(data));

});

self.addEventListener('notificationclick', function(event) {
  console.log('On notification click: ', event);
  // Android doesn’t close the notification when you click on it
  // See: http://crbug.com/463146
  event.notification.close();

  // This looks to see if the current is already open and
  // focuses if it is
  event.waitUntil(clients.matchAll({
		type: 'window'
	})
	.then(function(clientList) {
		if (clients.openWindow) {
			return clients.openWindow(event.notification.tag);
		}
	}))
  ;
});

self.addEventListener('install', function(event) {

	console.log('Service worker installed', event);

});
