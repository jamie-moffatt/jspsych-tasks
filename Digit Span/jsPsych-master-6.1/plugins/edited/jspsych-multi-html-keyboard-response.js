/**
 * jspsych-html-keyboard-response
 * Josh de Leeuw
 *
 * plugin for displaying a stimulus and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/


jsPsych.plugins["multi-html-keyboard-response"] = (function() {

  var plugin = {};

  plugin.info = {
    name: 'multi-html-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.HTML_STRING,
        array: true,
        pretty_name: 'stimulus',
        default: undefined,
        description: 'The HTML string to be displayed'
      },
      gap_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Gap Duration',
        default: -1,
        description: 'The gap between each stimulus.'
      },
      stimulus_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Stimulus duration',
        default: -1,
        description: 'How long to hide the stimulus.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        array: true,
        pretty_name: 'Choices',
        default: jsPsych.ALL_KEYS,
        description: 'The keys the subject is allowed to press to respond to the stimulus.'
      },
      prompt: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Prompt',
        default: '',
        description: 'Any content here will be displayed below the stimulus.'
      },
      trial_duration: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Trial duration',
        default: -1,
        description: 'How long to show trial before it ends.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, trial will end when subject makes a response.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    // store response
    var response = {
      rt: [],
      key: []
    };

    // function to end trial when it is time
    var end_trial = function() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // kill keyboard listeners
      if (typeof keyboardListener !== 'undefined') {
        jsPsych.pluginAPI.cancelKeyboardResponse(keyboardListener);
      }

      // gather the data to store for the trial
      var trial_data = {
        "rt": response.rt,
        "stimulus": trial.stimulus,
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };


    var show_stim = function(stim, tno) {
      jsPsych.pluginAPI.setTimeout(function() {
        var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+stim+'</div>';
        display_element.innerHTML = new_html;
        display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'visible';
      }, (trial.stimulus_duration + trial.gap_duration) * tno)
    }

    var hide_stim = function(tno) {
      // hide stimulus if stimulus_duration is set - after stimulus_duration time it hides the stimuli
        jsPsych.pluginAPI.setTimeout(function() {
          display_element.querySelector('#jspsych-html-keyboard-response-stimulus').style.visibility = 'hidden';
        }, (trial.stimulus_duration * (tno+1)) + (trial.gap_duration * (tno))
      );
    }

    for (var i = 0; i < trial.stimulus.length; i++) {
      if (i == trial.stimulus.length) {
        end_trial();
      }
      var stimulus = trial.stimulus[i];
      console.log(stimulus);
      show_stim(stimulus, i);
      hide_stim(i);
    }

    jsPsych.pluginAPI.setTimeout(function() { end_trial();},
     trial.stimulus.length*(trial.stimulus_duration + trial.gap_duration)
   );
// length = 3, then i finish on 2. Could set end_trial on a timeout - for end of the final sentence


  // var new_html = '<div id="jspsych-html-keyboard-response-stimulus">'+stim+'</div>';
  //
  //   // add prompt
  //   new_html += trial.prompt;
  //
  //   // draw
  //





    // function to handle responses by the subject
    var after_response = function(info) {

      // after a valid response, the stimulus will have the CSS class 'responded'
      // which can be used to provide visual feedback that a response was recorded
      display_element.querySelector('#jspsych-html-keyboard-response-stimulus').className += ' responded';

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start the response listener
    if (trial.choices != jsPsych.NO_KEYS) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // // hide stimulus if stimulus_duration is set
    // if (trial.stimulus_duration > 0) {
    //   hide_stim();
    // }

    // end trial if trial_duration is set
    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
