/****************

Digit Span Task

*****************/

// Memory task. On each trial, participants view a sequence of numbers, and must then recall the sequence of numbers in reverse.
// Starts with sequence of two numbers, which increases with each correct response. After 2 incorrect responses in a row, sequence length decreases by 1.
// There are 14 trials, along with a "practice" trial, which provides feedback to the participant.

/************** Required ***************/
// variables that are required for the task to work

/* Helper functions */
// Two helper functions for generating correct sequences for the DS task

// check's a sequence for ascending, descending or equal digits next to each other (e.g. no 1-2, 2-1, 1-1 etc.)
var check_sequence = function(seq) {
  for (var i = 0; i < seq.length-1; i++) {
    var check = seq[i] - seq[i+1];
    // if any consecutive numbers are ascending or descending by 1, or are equal, returns false
    if (check == 1 || check == -1 || check == 0) {  return false; }
  }
  return true;
}

// generates a sequence of specified length from a list of digits
var generate_sequence = function(digits, seq_length) {
  var sequence = [];
  // generates random sequence;
  if (seq_length > 9) {
    sequence = jsPsych.randomization.sampleWithReplacement(digits, seq_length);
  } else {
    sequence = jsPsych.randomization.sampleWithoutReplacement(digits, seq_length);
  }

  // Ensures sequence follows criteria in check_sequence function
  while (!check_sequence(sequence)) {
    if (seq_length > 9) {
      sequence = jsPsych.randomization.sampleWithReplacement(digits, seq_length);
    } else {
      sequence = jsPsych.randomization.sampleWithoutReplacement(digits, seq_length);
    }
  }

  // readies sequence for display in trial
  for (var i = 0; i < sequence.length; i++) {
    sequence[i] = "<p style = 'font-size: 72px'>" + sequence[i] + "</p>";
  };

  return sequence;
}


// Defines digits we want to use
var DS_digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Defines initial sequence length
var DS_seq_length = 2;

// Defines the initial sequence
var DS_sequence = generate_sequence(DS_digits, DS_seq_length);

// Defines maximum number of trials for the digit span task
var DS_num_trials = 14;

// set to true for backwards digit span, set to false for forward digit span
var DS_reverse = true;

// predefines other necessary variables
var DS_count_trials = 0; // Tracks how many trials completed
var DS_false_streak = 0; // Tracks how many false responses in a row
var DS_accuracy; // Tracks accuracy of response on each trial


/******************* Define Instructions ******************/
// Define various instructions used throughout the digit span task

var DS_instructions = {
  type: "instructions",
  pages: ["<p>You will see a series of numbers, and will then be asked to recall the numbers in reverse order.</p><p>So, for example, if you saw the number 1, then the number 9, you would enter 9, 1 at the answer screen. If you saw the series 2-5-3-1, you would then enter 1-3-5-2 at the answer screen. After you have entered your answer, press the 'Submit' button to submit your answer. You will have up to 60 seconds to submit your answer.</p>" +
  "<p>Click 'Continue' to start a short practice task."],
  show_clickable_nav: true
}

var DS_end_task = {
  type: 'instructions',
  pages: ["This is the end of this task. Press the button below to go to the next task."],
  show_clickable_nav: true
}



/****************** Defining Trials *****************/
// Define the individual trials for the task - what you want to repeat

// Displays the sequence length for the upcoming sequence
var DS_show_sequence_length = {
  type: 'html-keyboard-response',
  stimulus: function() { return '<p style = "font-size: 48px;">' + DS_seq_length + ' Digits</p>'},
  choices: jsPsych.NO_KEYS,
  trial_duration: 1000,
  post_trial_gap: 200
}

// Displays each number in the sequence, no response
var DS_display_trial = {
  type: "multi-html-no-response",
  stimulus: function() { return DS_sequence;},
  choices: jsPsych.NO_KEYS,
  stimulus_duration: 1000,
  gap_duration: 500
}

// Displays the keypad, asks participant to make a response
var DS_response_trial = {
  type: "html-button-multi-response",
  stimulus: "",
  // edit button html with button_html:
  button_html: '<button class="jspsych-btn" style = "font-size: 72px;">%choice%</button>',
  margin_vertical: "5px",
  choices: ["1", "2", "3", "4", "5", "6", "7", "8", "9"],
  response_ends_trial: false,
  // Could specify a maximum response time.
  trial_duration: 60000,
  post_trial_gap: 200,
  data: {task: "digit-span"},
  // submit-btn, custom entry that will allows you to specify a custom submit button. Must have id = "submit-btn"
  submit_btn: '<button id = "submit-btn" class="jspsych-btn">Submit</button>',
  on_finish: function(data) {
    var responses = [];
    var button_pressed = [];

    // gets the responses made
    button_pressed = JSON.parse(data.button_pressed);

    // for loop to get actual responses (+1 to avoid zero-indexed)
    for (i = 0; i < button_pressed.length; i++) {
      responses[i] = parseInt(button_pressed[i]) + 1;
    }

    // strips html from "sequence", to check accuracy
    for (i = 0; i < DS_sequence.length; i++) {
      DS_sequence[i] = jQuery(DS_sequence[i]).text();
    };

    // if backwards digit span, reverse the sequence when checking accuracy
    if (DS_reverse) {
      DS_sequence = DS_sequence.reverse();
    }
    // check accuracy of responses - first check the length of the two
    if (responses.length != DS_sequence.length) {
      DS_accuracy = false;
    } else {
      // loops through each response, compares the reversed sequence
      for (var i = 0; i < DS_sequence.length; i++) {
        var accurate = (responses[i] == DS_sequence[i])
        // if any of them are false, declare accuracy = false, break out of this for loop
        if (accurate == false) {
          DS_accuracy = false;
          break
        } else {
          DS_accuracy = true;
        }
      }
    }
    // save response and accuracy data to the data
    jsPsych.data.addDataToLastTrial({correct_response: JSON.stringify(DS_sequence), participant_response: JSON.stringify(responses), accuracy: DS_accuracy});
  }
}

// Displays feedback for the participant (only for practice)
var DS_feedback_trial = {
  type: 'html-button-response',
  data: {task: "digit-span", practice: true},
  stimulus: function() {
    // if previous answer was accurate, displays correct, if not, displays incorrect
    if (DS_accuracy) {
      return '<p style="font-size: 48px; color: rgb(0, 153, 51)">Correct</p><p>You responded correctly! The main task is exactly the same, except you will not receive feedback. Press the button below to begin the main task.</p>'
    } else {
      return '<p style="font-size: 48px; color: rgb(204, 0, 0)">Incorrect</p><p>Remember, you just need to enter the numbers you saw, in reverse order. For example, if you saw the numbers 1, 9 you would enter 9, 1. When you have entered the numbers, press "Submit" to submit your answer. Please press the button below to try the practice again.</p>'
    }
  },
  trial_duration: 100000,
  choices: ["Continue"]
}

/************************* Defining Blocks ******************/
// Defines the blocks for practice and main tasks - how to repeat the trials

// Practice block - shows feedback after response, and replays if participant is wrong
var DS_practice_node = {
  timeline: [DS_show_sequence_length, DS_display_trial, DS_response_trial, DS_feedback_trial],
  loop_function: function() {
    if (DS_accuracy) {
      // if true, generate new sequence, continue to experimental trials
      DS_sequence = generate_sequence(DS_digits, DS_seq_length);
      return false;
    } else {
      // if false, generate new sequence, loop the practice trials
      DS_sequence = generate_sequence(DS_digits, DS_seq_length);
      return true
    }
  }
}

// Main block - displays new sequence each time, with seq_length changed depending on previous responses
var DS_experiment_node = {
  // the trials to loop
  timeline:  [DS_show_sequence_length, DS_display_trial, DS_response_trial],
  loop_function: function() {
    // counts number of trials
    DS_count_trials = DS_count_trials + 1;
    // gets data of last two trials
    var data = jsPsych.data.get().filter({trial_type: "html-button-multi-response"}).last(2).values();
    // Replays unless we've surpassed maximum number of trials
    if (DS_count_trials < DS_num_trials) {
      // if last trial response was accurate, increase sequence length, reset false streak. Otherwise increase false streak
      if (data[1].accuracy) {
        DS_seq_length = DS_seq_length + 1;
        DS_false_streak = 0;
      } else {
        DS_false_streak = DS_false_streak + 1;
      }

      // if false streak greater than 2 (and seq_length greater than 2), reduce sequence length
      if (DS_false_streak == 2 && DS_seq_length > 2) {
        DS_seq_length = DS_seq_length - 1;
        DS_false_streak = 0;
      }

      // generate the new sequence with the new sequence length, loop
      DS_sequence = generate_sequence(DS_digits, DS_seq_length);
      return true;
    } else {
      return false;
    }
  }
}


/******************* Pushing to timeline ******************/
var DS_timeline = [];
DS_timeline.push(DS_instructions);
DS_timeline.push(DS_practice_node);
DS_timeline.push(DS_experiment_node);
DS_timeline.push(DS_end_task);
