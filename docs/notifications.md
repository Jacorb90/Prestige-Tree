# Notifications

Notifications will appear in the top right for a limited time, to deliver a message to the player.

The appearance, title, content and duration of the notifications can be altered.

### Setup

For notifications to work, you need to have the following included (all of which I've done in this PR):

- The **notification-container** div within index.html
- The ```addNotification``` in mod.js (to facilitate creating new notifications)
- The ```adjustNotificationTime``` function in mod.js (to reduce the timers on the notifications each tick)
- The variable ```activeNotifications``` initialised as an empty array (in mod.js) - this is where notifications are stored
- The variable ```notificationID``` initialised as 0 (in mod.js) - this ensures Vue knows which notification is which
- The ```notification.css``` stylesheet (to properly display notifications and their transitions above other content)

The function ```adjustNotificationTime(diff)``` needs to be called every tick. I'd recommend placing it inside the ```update(diff)``` function on a layer.

### Notification types

Notification types are defined within the ```addNotification``` function in ```mod.js```. You can add or amend types by altering the ```switch``` statement:

```
		case "achievement": // The name of the notification "type"
			notificationTitle = "Achievement Unlocked!"; // The default "title" for this type of notification
			notificationType = "achievement-notification" // The name of the CSS class for this notification
			break;
```

In addition, you should define the CSS class within **notification.css**:

```
.achievement-notification {
	border-color: #51629C;
	background: #7182BC;
}
```

### New Notifications

To create a notification in-game, call the below function:
```addNotification(type,text,title,timer)```

You can pass the following parameters to this function:

- type: The type (CSS style and default settings) of notification to show. This should be one of the entries in the ```switch``` statement described above.

- text: The main message to show within the notification box. This can contain HTML tags (<b> or <i> etc.)

- title: The title to appear at the top of the notification box, above the main message. A default title can be specified in the ```switch``` statement and will be used if this parameter is omitted.

- timer: The time in seconds for the notification to stay on screen. If omitted, this will default to 3 seconds.