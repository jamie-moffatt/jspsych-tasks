/**
 * jspsych-audio-keyboard-response
 * Josh de Leeuw
 *
 * plugin for playing an audio file and getting a keyboard response
 *
 * documentation: docs.jspsych.org
 *
 **/

jsPsych.plugins["multiple-audio-keyboard-response"] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('audio-keyboard-response', 'stimulus', 'audio');

  plugin.info = {
    name: 'multiple-audio-keyboard-response',
    description: '',
    parameters: {
      stimulus: {
        type: jsPsych.plugins.parameterType.AUDIO,
        pretty_name: 'Stimulus',
        default: undefined,
        array: true,
        description: 'The audio to be played. Each element of array is a new audio.'
      },
      volume: {
        type: jsPsych.plugins.parameterType.FLOAT,
        pretty_name: 'Volume',
        default: 1,
        array: true,
        description: 'The volumes of each respective audio to be played.'
      },
      choices: {
        type: jsPsych.plugins.parameterType.KEYCODE,
        pretty_name: 'Choices',
        array: true,
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
        description: 'The maximum duration to wait for a response.'
      },
      response_ends_trial: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Response ends trial',
        default: true,
        description: 'If true, the trial will end when user makes a response.'
      },
      trial_ends_after_audio: {
        type: jsPsych.plugins.parameterType.BOOL,
        pretty_name: 'Trial ends after audio',
        default: false,
        description: 'If true, then the trial will end as soon as the audio file finishes playing.'
      },
    }
  }

  plugin.trial = function(display_element, trial) {

    // setup stimulus
    var context = jsPsych.pluginAPI.audioContext();
    var gainNode1 = context.createGain();
    var gainNode2 = context.createGain();

    if(context !== null){

      var source1 = context.createBufferSource();
      source1.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus[0]);
      source1.connect(gainNode1);
      gainNode1.connect(context.destination)

      var source2 = context.createBufferSource();
      source2.buffer = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus[1])
      source2.connect(gainNode2);
      gainNode2.connect(context.destination);

    } else {

      var audio = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus[0]);
      audio.currentTime = 0;

      var audio2 = jsPsych.pluginAPI.getAudioBuffer(trial.stimulus[1]);
      audio2.currentTime = 0;
    }


    // set up end event if trial needs it

    if(trial.trial_ends_after_audio){
      if(context !== null){
        source.onended = function() {
          end_trial();
        }
      } else {
        audio.addEventListener('ended', end_trial);
      }
    }

    // show prompt if there is one
    if (trial.prompt !== "") {
      display_element.innerHTML = trial.prompt;
    }

    // store response
    var response = {
      rt: -1,
      key: -1
    };

    // function to end trial when it is time
    function end_trial() {

      // kill any remaining setTimeout handlers
      jsPsych.pluginAPI.clearAllTimeouts();

      // stop the audio file if it is playing
      // remove end event listeners if they exist
      if(context !== null){
        source1.stop();
        source1.onended = function() { }
        source2.stop();
        source2.onended = function() { }
      } else {
        audio.pause();
        audio.removeEventListener('ended', end_trial);
        audio2.pause();
        audio2.removeEventListener('ended', end_trial);
      }

      // kill keyboard listeners
      jsPsych.pluginAPI.cancelAllKeyboardResponses();

      // gather the data to store for the trial
      var trial_data = {
        "rt": context !== null ? response.rt * 1000 : response.rt,
        "stimulus": trial.stimulus[0],
        "stimulus2": trial.stimulus[1],
        "volume1": trial.volume[0],
        "volume2": trial.volume[1],
        "key_press": response.key
      };

      // clear the display
      display_element.innerHTML = '';

      // move on to the next trial
      jsPsych.finishTrial(trial_data);
    };

    // function to handle responses by the subject
    var after_response = function(info) {

      // only record the first response
      if (response.key == -1) {
        response = info;
      }

      if (trial.response_ends_trial) {
        end_trial();
      }
    };

    // start audio
    if(context !== null){
      context.resume();
      startTime = context.currentTime + 0.1;
      gainNode1.gain.value = trial.volume[0];
      gainNode2.gain.value = trial.volume[1];
      source1.start(startTime);
      source2.start(startTime);
    } else {
      audio.play();
      audio2.play();
    }

    // start the response listener
    if(context !== null) {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'audio',
        persist: false,
        allow_held_key: false,
        audio_context: context,
        audio_context_start_time: startTime
      });
    } else {
      var keyboardListener = jsPsych.pluginAPI.getKeyboardResponse({
        callback_function: after_response,
        valid_responses: trial.choices,
        rt_method: 'date',
        persist: false,
        allow_held_key: false
      });
    }

    // end trial if time limit is set
    if (trial.trial_duration > 0) {
      jsPsych.pluginAPI.setTimeout(function() {
        end_trial();
      }, trial.trial_duration);
    }

  };

  return plugin;
})();
