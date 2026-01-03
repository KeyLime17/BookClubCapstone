<?php

namespace App\Notifications;

use App\Models\BookSubmission;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Notification;

class SubmissionApproved extends Notification
{
    use Queueable;

    public function __construct(public BookSubmission $submission) {}

    public function via($notifiable): array
    {
        return ['database'];
    }

    public function toDatabase($notifiable): array
    {
        return [
            'type' => 'submission_approved',
            'submission_id' => $this->submission->id,
            'title' => $this->submission->title,
            'message' => "Your book submission \"{$this->submission->title}\" was approved.",
        ];
    }
}
