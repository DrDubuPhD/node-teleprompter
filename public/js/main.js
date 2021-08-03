$(function () {
    let playing = false;
    let secret = "";

    /*
    SOCKETS AND BACKEND COMMUNICATION CODE
    */

    // Socket connection
    const socket = io();

    $('.remote-play > button').click(function () {
        socket.emit('remote-pp', secret);
    });

    socket.on('server-remote-pp', function () {
        startstop();
    });

    /*
    PAGE EVENT HANDLING
    */

    // Hide the prompter section initially on load
    $("#selection-bar").toggle();
    $("#prompter-container").toggle();
    $('#remote-control-container').toggle();

    // Range sliders event handling
    $('#speed-range-value').html($('#speed-range').val());
    $('#font-range-value').html($('#font-range').val());

    $("#font-range").on('input change', function () {
        updateFontValue($(this).val());
        changeFontSize($(this).val());
    });

    $("#speed-range").on('input change', function () {
        updateSpeedValue($(this).val());
    });

    function updateFontValue(font_value) {
        $("#font-range-value").html(font_value);
    }

    function updateSpeedValue(speed_value) {
        $("#speed-range-value").html(speed_value);
    }

    function changeFontSize(font_value) {
        $("#text_area").css("font-size", font_value);
    }

    // When user submits the form with the script
    $("#script_enter_area").submit(function (e) {
        e.preventDefault();

        // Storing the text and saving into a variable
        var reading_script = $("#script_box").val();
        reading_script = '<br><br>' + reading_script + '<br><br><br><br><br><br><br><br>';

        // Hide the form container
        $("#script_enter_container").toggle();

        // Insert the text into the prompter area (html)
        $("#prompter-container #text_area").html(reading_script);

        // Reveal the prompter area
        $("#prompter-container").toggle();
        $("#selection-bar").toggle();
    });

    $('#prompter-container #back-to-edit').click(function () {
        // Hide the prompter container
        $("#prompter-container").toggle();
        $("#selection-bar").toggle();

        // Reveal form container
        $("#script_enter_container").toggle();
    });

    /*
    REMOTE CONTROL
    */

    $("#remote").click(function () {
        //Reveal remote control container
        $('#remote-control-container').toggle();

        //Hide the UI Controls
        $('#remote-control-box').toggle();
    });

    $('#remote-auth').submit(function (e) {
        e.preventDefault();
        secret = $('#remote-auth-secret').val();
        socket.emit('handshake', secret);
    });

    socket.on('access', function (isGranted) {
        if (isGranted) {
            // Reveal the UI Controls
            $('#remote-control-box').toggle();

            // Hide the form
            $('#remote-auth').toggle();

        } else {
            alert('Invalid secret');
        }
    });

    /*
    SCROLLING EVENT
    */

    $("#play-pause").click(function () {
        startstop();
    });

    $("#blue-arrow").click(function () {
        startstop();
    });

    $(document).keyup(function (e) {
        if (e.keyCode == 190 && $("#script_enter_container").css('display') == 'none') {
            e.preventDefault();
            startstop();
        }
    });

    $(document).keyup(function (e) {
        if (e.keyCode == 27 && $("#script_enter_container").css('display') == 'none') {
            e.preventDefault();
            startstop();

            // Hide the prompter container
            $("#prompter-container").toggle();
            $("#selection-bar").toggle();

            // Reveal form container
            $("#script_enter_container").toggle();
        }
    });

    $('#speed-up').click(function () {
        socket.emit('server-change-speed', {
            newspeed: $('#speed-range').val() == 20 ? 20 : $('#speed-range').val() + 1,
            client_secret: secret
        });
    });

    $('#slow-down').click(function () {
        socket.emit('server-change-speed', {
            newspeed: $('#speed-range').val() == 0 ? 0 : $('#speed-range').val() + 1,
            client_secret: secret
        });
    });

    socket.on('ack-change-speed', function (newSpeed) {
        startStop(newSpeed);
    });

    function startstop(remote_speed) {
        if (remote_speed) {
            speed = 420000 / remote_speed;
        } else {
            speed = 420000 / $('#speed-range').val();
        }

        if (!playing) { // if the animation is not playing then play, set playing to true and play
            playing = !playing;
            $("html, body").animate({ scrollTop: $(document).height() }, speed, "linear", function () {
                playing = !playing;
                $("html, body").stop();
            });
        } else if (playing) { // if is playing, set playing to false and stop
            playing = !playing;
            $("html, body").stop();
        }
    }
});