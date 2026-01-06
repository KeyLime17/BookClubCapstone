<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class DmRequestNotification extends Notification
{
    use Queueable;

    public function __construct(
        public int $conversationId,
        public int $fromUserId,
        public string $fromUserName
    ) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'dm_request',
            'conversation_id' => $this->conversationId,
            'from_user_id' => $this->fromUserId,
            'from_user_name' => $this->fromUserName,
        ];
    }
}
