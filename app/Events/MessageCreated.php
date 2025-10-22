<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public Message $message) {}

    public function broadcastAs(): string
    {
        return 'message.created';
    }

    public function broadcastOn(): array
    {
        $club = $this->message->club;

        // Global/public rooms use public channels; private rooms use private channels
        return $club->is_public
            ? [ new Channel("club.{$club->id}") ]
            : [ new PrivateChannel("club.{$club->id}") ];
    }

    public function broadcastWith(): array
    {
        return [
            'id'         => $this->message->id,
            'club_id'    => $this->message->club_id,
            'type'       => $this->message->type,
            'body'       => $this->message->body,
            'created_at' => optional($this->message->created_at)->toISOString(),
            'user'       => $this->message->user ? [
                'id'   => $this->message->user->id,
                'name' => $this->message->user->name,
            ] : null,
        ];
    }
}
