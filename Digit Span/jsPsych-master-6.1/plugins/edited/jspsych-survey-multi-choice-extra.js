/**
 * jspsych-survey-multi-choice
 * a jspsych plugin for multiple choice survey questions
 *
 * Shane Martin
 *
 * documentation: docs.jspsych.org
 *
 */


jsPsych.plugins['survey-multi-choice-extra'] = (function() {
  var plugin = {};

  plugin.info = {
    name: 'survey-multi-choice-extra',
    description: '',
    parameters: {
      questions: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Questions',
        nested: {
          prompt: {type: jsPsych.plugins.parameterType.STRING,
                     pretty_name: 'Prompt',
                     default: undefined,
                     description: 'The strings that will be associated with a group of options.'},
          options: {type: jsPsych.plugins.parameterType.STRING,
                     pretty_name: 'Options',
                     array: true,
                     default: undefined,
                     description: 'Displays options for an individual question.'},
          required: {type: jsPsych.plugins.parameterType.BOOL,
                     pretty_name: 'Required',
                     default: false,
                     description: 'Subject will be required to pick an option for each question.'},
          horizontal: {type: jsPsych.plugins.parameterType.BOOL,
                        pretty_name: 'Horizontal',
                        default: false,
                        description: 'If true, then questions are centered and options are displayed horizontally.'},
        }
      },
      preamble: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Preamble',
        default: '',
        description: 'HTML formatted string to display at the top of the page above all the questions.'
      },
      extra_option: {
        type: jsPsych.plugins.parameterType.INT,
        pretty_name: 'Extra Option',
        default: -1,
        description: 'Specify which option must be chosen for the extra questions to appear.'
      },
      extra_likert: {
        type: jsPsych.plugins.parameterType.COMPLEX,
        array: true,
        pretty_name: 'Extra Likert',
        nested: {
          prompt: {type: jsPsych.plugins.parameterType.STRING,
                     pretty_name: 'Prompt',
                     default: undefined,
                     description: 'Questions that are associated with the slider.'},
          labels: {type: jsPsych.plugins.parameterType.STRING,
                   array: true,
                   pretty_name: 'Labels',
                   default: undefined,
                   description: 'Labels to display for individual question.'},
          required: {type: jsPsych.plugins.parameterType.BOOL,
                     pretty_name: 'Required',
                     default: false,
                     description: 'Makes answering questions required.'}
        }
      },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default: '',
        description: 'Label of the button.'
      }
    }
  }
  plugin.trial = function(display_element, trial) {
    var plugin_id_name = "jspsych-survey-multi-choice-extra";
    var plugin_id_selector = '#' + plugin_id_name;
    var _join = function( /*args*/ ) {
      var arr = Array.prototype.slice.call(arguments, _join.length);
      return arr.join(separator = '-');
    }

    // inject CSS for trial
    display_element.innerHTML = '<style id="jspsych-survey-multi-choice-extra-css"></style>';
    // the multi-choice css
    var cssstr = ".jspsych-survey-multi-choice-extra-question { margin-top: 2em; margin-bottom: 2em; text-align: center; }"+
      ".jspsych-survey-multi-choice-extra-text span.required {color: darkred;}"+
      ".jspsych-survey-multi-choice-extra-horizontal .jspsych-survey-multi-choice-extra-text {  text-align: center; font-size: 16px;}"+
      ".jspsych-survey-multi-choice-extra-option { line-height: 2; }"+
      ".jspsych-survey-multi-choice-extra-horizontal .jspsych-survey-multi-choice-extra-option {  display: inline-block;  margin-left: 1em;  margin-right: 1em;  vertical-align: top;}"+
      "label.jspsych-survey-multi-choice-extra-text input[type='radio'] {margin-right: 1em;}" +
// the likert css
      ".jspsych-survey-likert-statement { display:block; font-size: 16px; padding-top: 5px; margin-bottom:5px; }"+
        ".jspsych-survey-likert-opts { list-style:none; width:50%; margin:auto; padding:0 0 5px; display:block; font-size: 14px; line-height:1.1em; }"+
        ".jspsych-survey-likert-opt-label { line-height: 1.1em; color: #444; }"+
        ".jspsych-survey-likert-opts:before { content: ''; position:relative; top:11px; /*left:9.5%;*/ display:block; background-color:#efefef; height:4px; width:100%; }"+
        ".jspsych-survey-likert-opts:last-of-type { border-bottom: 0; }"+
        ".jspsych-survey-likert-opts li { display:inline-block; /*width:19%;*/ text-align:center; vertical-align: top; }"+
        ".jspsych-survey-likert-opts li input[type=radio] { display:block; position:relative; top:0; left:50%; margin-left:-6px; }"


    display_element.querySelector('#jspsych-survey-multi-choice-extra-css').innerHTML = cssstr;

    // form element
    var trial_form_id = _join(plugin_id_name, "form");
    display_element.innerHTML += '<form id="'+trial_form_id+'"></form>';
    var trial_form = display_element.querySelector("#" + trial_form_id);
    // show preamble text
    var preamble_id_name = _join(plugin_id_name, 'preamble');
    trial_form.innerHTML += '<div id="'+preamble_id_name+'" class="'+preamble_id_name+'">'+trial.preamble+'</div>';

    // add multiple-choice questions
    for (var i = 0; i < trial.questions.length; i++) {
        // create question container
        var question_classes = [_join(plugin_id_name, 'question')];
        if (trial.questions[i].horizontal) {
          question_classes.push(_join(plugin_id_name, 'horizontal'));
        }

        trial_form.innerHTML += '<div id="'+_join(plugin_id_name, i)+'" class="'+question_classes.join(' ')+'"></div>';

        var question_selector = _join(plugin_id_selector, i);

        // add question text
        display_element.querySelector(question_selector).innerHTML += '<p class="' + plugin_id_name + '-text survey-multi-choice">' + trial.questions[i].prompt + '</p>';

      // create option radio buttons
      for (var j = 0; j < trial.questions[i].options.length; j++) {
        var option_id_name = _join(plugin_id_name, "option", i, j),
        option_id_selector = '#' + option_id_name;

        // add radio button container
        display_element.querySelector(question_selector).innerHTML += '<div id="'+option_id_name+'" class="'+_join(plugin_id_name, 'option')+'"></div>';

        // add label and question text
        var form = document.getElementById(option_id_name)
        var input_name = _join(plugin_id_name, 'response', i);
        var input_id = _join(plugin_id_name, 'response', i, j);
        var label = document.createElement('label');
        label.setAttribute('class', plugin_id_name+'-text');
        label.innerHTML = trial.questions[i].options[j];
        label.setAttribute('for', input_id)

        // create radio button
        var input = document.createElement('input');
        input.setAttribute('type', "radio");
        input.setAttribute('name', input_name);
        input.setAttribute('id', input_id);
        input.setAttribute('value', trial.questions[i].options[j]);
        form.appendChild(label);
        form.insertBefore(input, label);
      }



      if (trial.questions[i].required) {
        // add "question required" asterisk
        display_element.querySelector(question_selector + " p").innerHTML += "<span class='required'>*</span>";

        // add required property
        display_element.querySelector(question_selector + " input[type=radio]").required = true;
      }


      if (trial.extra_option == -1) {

      } else {
        var html = "";
        html += '<form id="jspsych-survey-likert-form"><div id="jspsych-survey-likert-opts-' + i +'" style="display:none">';

        // add likert scale questions
        for (var n = 0; n < trial.extra_likert.length; n++) {
          // add question
          html += '<label class="jspsych-survey-likert-statement">' + trial.extra_likert[n].prompt + '</label>';
          // add options
          var width = 100 / trial.extra_likert[n].labels.length;
          // display set to none - will only appear if extra_option is clicked
          var options_string = '<ul class="jspsych-survey-likert-opts"  data-radio-group="Q' + n + '">';
          for (var x = 0; x < trial.extra_likert[n].labels.length; x++) {
            options_string += '<li style="width:' + width + '%"><input type="radio" name="Q' + n + '-'+i+'" value="' + x + '"';
            if(trial.extra_likert[n].required){
              options_string += ' required';
            }
            options_string += '><label class="jspsych-survey-likert-opt-label">' + trial.extra_likert[n].labels[x] + '</label></li>';
          }
          options_string += '</ul>';
          html += options_string;
        }
        html += '</div></form>'
        display_element.querySelector(question_selector).innerHTML += html
    }

  }

// on each click, runs function to check if extra_option is selected
  display_element.onclick = function() {
    var extra_option = trial.extra_option;
    for (var i = 0; i < trial.questions.length; i++) {

// if checked
    if (display_element.querySelector("#jspsych-survey-multi-choice-extra-response-" + i + "-" + extra_option).checked) {
      //display_element.querySelector("#jspsych-survey-likert-opts-" + i).style.display = "block";
      $("#jspsych-survey-likert-opts-" + i).slideDown('fast');
    }

// if not checked
    if (!display_element.querySelector("#jspsych-survey-multi-choice-extra-response-" + i + "-" + extra_option).checked) {

// clear values for the specific question if "no" selected
      for (var n = 0; n < trial.extra_likert.length; n++) {
        for (var x = 0; x < trial.extra_likert[n].labels.length; x++) {

        $("#jspsych-survey-likert-opts-"+i+" input[name='Q"+n+"-"+i+"'][value="+x+"]").attr("checked", false);

      }
    }
      //display_element.querySelector("#jspsych-survey-likert-opts-" + i).style.display = "none";
      // uses jquery to hide the questions smoothly
      $("#jspsych-survey-likert-opts-" + i).slideUp('fast');
    }
  }
}





    // add submit button
    trial_form.innerHTML += '<input style="padding:10px;" type="submit" id="'+plugin_id_name+'-next" class="'+plugin_id_name+' jspsych-btn"' + (trial.button_label ? ' value="'+trial.button_label + '"': '') + '></input>';
    trial_form.addEventListener('submit', function(event) {
      event.preventDefault();

      // measure response time
      var endTime = (new Date()).getTime();
      var response_time = endTime - startTime;



      var question_data = {};
      var extra_likert_data = {};
      var matches = display_element.querySelectorAll("div." + plugin_id_name + "-question");
      var extra_option = trial.questions[0].options[trial.extra_option]

      // for each option, checks if its been checked or not
      // i need to add something to go through each likert scale as well
      for(var i=0; i<matches.length; i++){
        match = matches[i];
        //console.log(match)
        var q_id = "Q" + i;
        if(match.querySelector("input[type=radio]:checked") !== null){
          var val = match.querySelector("input[type=radio]:checked").value;

        } else {
          var val = "";
        }
        var obje = {};
        obje[q_id] = val;
        Object.assign(question_data, obje);

        // Need to edit this so that it saves the likert scales for each option

        var extra_array = [];
        var extra_matches = display_element.querySelector('#jspsych-survey-likert-opts-'+i)
        extra_matches = extra_matches.querySelectorAll('.jspsych-survey-likert-opts')
        for(var index = 0; index < extra_matches.length; index++){
          var id = extra_matches[index].dataset['radioGroup'];
          var el = display_element.querySelector('input[name="' + id + '-'+ i+'"]:checked');
          if (el === null) {
            var response = "";
          } else {
            var response = parseInt(el.value);
          }

          extra_array[index] = response;
        }
        //Object.assign(extra_likert_data, extra_array);
        extra_likert_data[q_id] = extra_array
      }
      // save data
      var trial_data = {
        "rt": response_time,
        "responses": JSON.stringify(question_data),
        "extra_responses": JSON.stringify(extra_likert_data)
      };
      display_element.innerHTML = '';

      // next trial
      jsPsych.finishTrial(trial_data);
    });

    var startTime = (new Date()).getTime();
  };

  return plugin;
})();
