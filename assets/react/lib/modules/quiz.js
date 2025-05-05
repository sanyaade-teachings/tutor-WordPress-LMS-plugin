import { get_response_message } from '../../helper/response';

window.jQuery(document).ready(($) => {
	const { __ } = wp.i18n;

	/**
	 * Quiz Frontend Review Action
	 * @since 1.4.0
	 */
	$(document).on('click', '.quiz-manual-review-action', function(e) {
		e.preventDefault();

		var $that = $(this);
		var attempt_id = $that.attr('data-attempt-id');
		var attempt_answer_id = $that.attr('data-attempt-answer-id');
		var mark_as = $that.attr('data-mark-as');
		var context = $that.attr('data-context');
		var back_url = $that.attr('data-back-url');

		$.ajax({
			url: _tutorobject.ajaxurl,
			type: 'POST',
			data: {
				attempt_id,
				attempt_answer_id,
				mark_as,
				context,
				back_url,
				action: 'review_quiz_answer',
			},
			beforeSend: function() {
				$that.addClass('is-loading');
			},
			success: function(data) {
				if (data.success && (data.data || {}).html) {
					$that.closest('.tutor-quiz-attempt-details-wrapper').html(data.data.html);
					return;
				}

				tutor_toast(__('Error!', 'tutor'), get_response_message(data), 'error');
			},
			complete: function() {
				$that.removeClass('is-loading');
			},
		});
	});
});
