function height_of(e) {
  var height = $(e).height()
  if (height == null) {
    return 0
  }
  return height
}

function map(f, l) {
  return l.map(function() {
    return f(this)
  })
}

function max(l) {
  return jQuery.makeArray(l.sort()).reverse()[0]
}

//see: http://stackoverflow.com/questions/946534/insert-text-into-textarea-with-jquery/946556#946556
jQuery.fn.extend({
  insertAtCaret: function(myValue) {
    return this.each(function(i) {
      if (document.selection) {
        //For browsers like Internet Explorer
        this.focus()
        sel = document.selection.createRange()
        sel.text = myValue
        this.focus()
      } else if (this.selectionStart || this.selectionStart == "0") {
        //For browsers like Firefox and Webkit based
        var startPos = this.selectionStart
        var endPos = this.selectionEnd
        var scrollTop = this.scrollTop
        this.value =
          this.value.substring(0, startPos) +
          myValue +
          this.value.substring(endPos, this.value.length)
        this.focus()
        this.selectionStart = startPos + myValue.length
        this.selectionEnd = startPos + myValue.length
        this.scrollTop = scrollTop
      } else {
        this.value += myValue
        this.focus()
      }
    })
  }
})

//code adapted from http://bootsnipp.com/snippets/featured/jquery-checkbox-buttons
$(function() {
  $(".search-choices .checkbox-inline").each(function() {
    // Settings
    var $widget = $(this),
      $checkbox = $widget.find("input:checkbox"),
      $button = $("#search-choice-" + $checkbox.attr("value")),
      color = $button.data("color"),
      settings = {
        on: {
          icon: "glyphicon glyphicon-check"
        },
        off: {
          icon: "glyphicon glyphicon-unchecked"
        }
      }

    // Event Handlers
    $button.on("click", function() {
      $checkbox.prop("checked", !$checkbox.is(":checked"))
      $checkbox.triggerHandler("change")
      updateDisplay()
    })
    $checkbox.on("change", function() {
      updateDisplay()
    })

    // Actions
    function updateDisplay() {
      var isChecked = $checkbox.is(":checked")

      // Set the button's state
      $button.data("state", isChecked ? "on" : "off")

      // Set the button's icon
      $button
        .find(".state-icon")
        .removeClass()
        .addClass("state-icon " + settings[$button.data("state")].icon)

      // Update the button's color
      if (isChecked) {
        $button.addClass("active")
        $("#" + $button.attr("id") + "-icon").removeClass("hide-bloc")
      } else {
        $button.removeClass("active")
        $("#" + $button.attr("id") + "-icon").addClass("hide-bloc")
      }
    }

    // Initialization
    function init() {
      updateDisplay()

      // Inject the icon if applicable
      if ($button.find(".state-icon").length == 0) {
        $button.prepend(
          '<i class="state-icon ' +
            settings[$button.data("state")].icon +
            '"></i> '
        )
      }
    }
    init()
  })
})

function components_loading_progress() {
  $(".components-loading-progress").rotate({
    angle: 0,
    animateTo: 360,
    callback: components_loading_progress,
    easing: function(x, t, b, c, d) {
      // t: current time, b: begInnIng value, c: change In value, d: duration
      return c * (t / d) + b
    }
  })
}

function loading_progress() {
  $("img.novaideo-loading-indicator").removeClass("hide-bloc")
}

function finish_progress() {
  $("img.novaideo-loading-indicator").addClass("hide-bloc")
}

function get_component_title(data) {
  var result = '<div class="view-item-title">'
  if (data.img) {
    result += '<img class="img-circle" src="' + data.img + '" width="25">'
  } else if (data.icon) {
    result += '<span class="icon ' + data.icon + '"></span>'
  }
  result += " <span>" + data.title + "</span></div>"
  return result
}

function focus_on_form(container) {
  setTimeout(function() {
    var form = $(container.find("form")).first()
    if (form.length > 0) {
      deform.focusFirstInput(form)
    }
  }, 200)
}

var emoji = undefined

function get_new_emoji() {
  emoji = new EmojiConvertor()
  var emoji_url = $(document.body).data("emoji_url")
  emoji.img_sets = {
    apple: {
      path: emoji_url,
      sheet: emoji_url,
      sheet_size: 32,
      mask: 1
    }
  }
  emoji.use_sheet = true
  emoji.init_env()
  return emoji
}

function init_emoji(nodes) {
  if (emoji == undefined) {
    emoji = get_new_emoji()
  }
  emoji.img_set = "apple"
  emoji.text_mode = false
  emoji.include_title = true
  $.each(nodes, function(index) {
    var node = $(this)
    node.html(emoji.replace_unified(emoji.replace_emoticons(node.html())))
    node.addClass("emojified")
  })
}

function update_notification_id(id, url) {
  $.post(url, { id: id }, function(data) {
    console.log(data)
  })
}

function collapse_current_collpsein() {
  var current_btn = $(this)
  var btns = $(".navbar-toggle.collapsed")
  for (var i = 0; i <= btns.length; i++) {
    var btn = $(btns[i])
    if (btn != current_btn) {
      $(btn.data("target")).collapse("hide")
    }
  }
}

function activate_explanation(event) {
  if ($(event.target).parents(".proposal-explanation").length == 0) {
    event.open_explanation = true
    $(".proposal-explanation:not(.closed)").addClass("closed")
    var explanation = $($(this).find(".proposal-explanation").first())
    explanation.removeClass("closed")
  }
}

function close_explanation(event) {
  var explanation = $($(this).parents(".proposal-explanation").first())
  explanation.addClass("closed")
}

function set_visited() {
  $.cookie("visited", "true", { path: "/", expires: 1 })
}

function reset_cookie_channels_bar() {
  var $this = $(".all-channels")
  if ($this.hasClass("toggled")) {
    $.cookie("channels", "off", { path: "/", expires: 1 })
  } else {
    $.cookie("channels", "on", { path: "/", expires: 1 })
  }
}

function reset_cookie_challenges_bar(isOpened) {
  if (isOpened) {
    $.cookie("challenges", "off", { path: "/", expires: 1 })
  } else {
    $.cookie("challenges", "on", { path: "/", expires: 1 })
  }
}

function init_channels_scroll() {
  if (!window.matchMedia("(max-width: 767px)").matches) {
    $(".channels-container").mCustomScrollbar({
      theme: "dark",
      scrollInertia: 100,
      scrollButtons: {
        enable: true
      },
      callbacks: {
        onScroll: function() {
          update_unread_messages_alerts()
        }
      }
    })
  } else {
    $(".channels-container").scroll(function() {
      update_unread_messages_alerts()
    })
  }
}

function init_card_position() {
  var card = $(".person-card-container:first>.listing-card")
  if (card.length > 0) {
    var min_top = 50
    var offset_top = card.offset().top
    var offset_left = card.offset().left
    if (!card.hasClass("fixed")) {
      card.data("initial_top", offset_top)
    } else {
      offset_top = card.data("initial_top")
    }
    var top = offset_top - $(window).scrollTop()
    if (top <= min_top) {
      card.addClass("fixed")
      card.css("top", min_top + "px")
      card.css("left", offset_left + "px")
    } else {
      card.removeClass("fixed")
    }
  }
}

function init_collapsible(element) {
  var collapsibles = element
    ? element.find(":header")
    : $(".collapsible-text :header")
  collapsibles.each(function() {
    var $this = $(this)
    var tagName = $this.prop("tagName").toLowerCase()
    var elements = $this.nextUntil(tagName)
    $this.wrap('<div class="collapsible-container"></div>')
    $(
      '<span class="glyphicon glyphicon-triangle-top collapsible-activator" title="' +
        novaideo_translate("Click here to collapse or to expand this section") +
        '""></span>'
    ).insertBefore($this)
    elements.insertAfter($this)
  })
}

function initscroll(result_scrolls) {
  result_scrolls = result_scrolls ? result_scrolls : $(".result-scroll")
  $.each(result_scrolls, function(index) {
    var result_scroll = $(this)
    var id = result_scroll.attr("id")
    $(result_scroll).infinitescroll(
      {
        behavior: "local",
        bufferPx: 0,
        binder: result_scroll,
        navSelector: "#" + id + " .batch",
        // selector for the paged navigation (it will be hidden)
        nextSelector: "#" + id + " .pager .next",
        // selector for the NEXT link (to page 2)
        itemSelector: "#" + id + " .result-container",

        pathParse: function(path, next_page) {
          var id = result_scroll.attr("id")
          var filter = $("#filter-" + id)
          var sort = $("#sort-" + id)
          var data_get = ""
          if (filter.length > 0) {
            var form = $($(filter).find("form").first())
            var filter_container = $(form.parents(".filter-container"))
            var filter_btn = $(filter_container.find(".filter-btn").first())
            data_get = $(form).serialize()
            data_get += "&" + "op=filter_result"
            var filter_source = filter_btn.data("filter_source")
            if (filter_source !== "") {
              data_get += "&" + "filter_source=" + filter_source
            }
            data_get += "&" + "filter_result=true"
            data_get += "&" + "scroll=true"
            data_get += "&" + "view_only=1"
          }
          if (sort.length > 0) {
            var sort_form = $(sort.find("form").first()).serialize()
            data_get += "&" + sort_form
          }
          data_get += "&load_view=load"
          data_get += "&on_demand=load"

          var f = function(currPage) {
            var next_path = $(
              $("#" + id + " .result-container")
                .first()
                .parents("div")
                .first()
                .find(">.result-container")
                .last()
            ).data("nex_url")
            return next_path + "&" + data_get
          }
          return f
        },
        loading: {
          finishedMsg:
            '<span class="label label-warning">' +
            novaideo_translate("No more item.") +
            "</span>",
          img: $("body").data("spinner"),
          msgText: ""
        }
      },
      function(elements) {
        var $this = $(this)
        var current_content = $this.find(".result-container").first()
        var scroll_items_container = $(
          current_content.find(".scroll-items-container").first()
        )
        var new_content = $($this.find(".result-container").last())
        var items = $(elements)
          .find(".scroll-items-container")
          .first()
          .find(">.scroll-item")
        var nex_url = new_content.data("nex_url")
        scroll_items_container.append(items)
        new_content.remove()
        if (nex_url) {
          current_content.data("nex_url", nex_url)
          current_content.attr("nex_url", nex_url)
        } else {
          $this
            .find(".btn-more-scroll")
            .parents(".btn-more-scroll-container")
            .remove()
        }
      }
    )
  })
}

function open_node_url() {
  window.open(
    $($(this).parents(".node").first().find(".node-shape").first()).attr("url")
  )
}

function init_morecontent_scroll() {
  var result_scrolls = $(".more-content-carousel")
  for (var i = 0; i <= result_scrolls.length; i++) {
    var result_scroll = $(result_scrolls[i])
    var last_child = $(result_scroll.find(".result-item").last())
    if (last_child.length > 0) {
      var top =
        last_child.offset().top -
        result_scroll.offset().top +
        last_child.height() +
        150
      if (top < 1600) {
        result_scroll.height(top)
      }
    } else {
      result_scroll.height(100)
    }
  }
}

function scroll_to_panel() {
  try {
    var url = document.location.toString()
    if (url.match("#")) {
      var panel = $("#" + url.split("#")[1])
      panel.addClass("in")
      panel.animate({ scrollTop: 0 }, 800)
    }
  } catch (e) {
    console.log(e)
  }
}

function rebuild_scrolls(scrolls) {
  if (!window.matchMedia("(max-width: 767px)").matches) {
    if (scrolls == undefined) {
      scrolls = $(".malihu-scroll")
    }
    if (scrolls.length > 0) {
      scrolls.mCustomScrollbar({
        theme: "dark",
        scrollInertia: 100,
        mouseWheelPixels: 90
      })
    }
  }
}

function display_carousel() {
  var $this = $(this)
  var index = $this.data("index")
  var container = $this.parents(".images-container").first()
  var files = container.data("files")
  var sliderId = container.data("id")
  if (files.length > 0) {
    var slider = renderFilesSlider(files, sliderId, index)
    var modal_container = $("#carousel-img-modal-container")
    $(modal_container.find(".modal-body")).html(slider)
    var title = get_comment_author_bloc($this)
    if (title.length == 0) {
      title = $(
        $this
          .parents(".view-item, .content-view")
          .first()
          .find(".view-item-title, .content-title")
          .first()
      )
      title = get_component_title({
        title: title.data("title"),
        img: title.data("img"),
        icon: title.data("icon")
      })
    }
    $(modal_container.find(".modal-title")).html(title)
    modal_container.css("opacity", "1")
    modal_container.modal("show")
    $("#" + sliderId).carousel({
      interval: false
    })
  }
  return false
}

function get_comment_author_bloc(element) {
  var comment_data = $(element.parents(".comment-card").first())
  var clone = $(comment_data.clone())
  var header = clone.find(".listing-card-header").first()
  clone.html(header)
  var author = clone.find(".listing-card-header .comment-author")
  header.html(author)
  return clone
}

function alert_user_unread_messages() {
  var is_unread = $(".all-channels .unread-comments-len").length > 0
  if (is_unread) {
    $(".all-channels-toggle:not(.close)").addClass("unread-comments")
  } else {
    $(".all-channels-toggle:not(.close)").removeClass("unread-comments")
  }
}

function unsubscribe_user_from_alerts(alerts) {
  var alert_content = $(alerts.find(".alerts-content"))
  if (!alert_content.hasClass("hide-bloc")) {
    var url = alert_content.data("unsubscribe_url")
    $.getJSON(url, {}, function(data) {
      if (data.status) {
        alerts.addClass("off")
      }
    })
  }
}

function init_collapsible_contents() {
  $.each($(".content-collapsible"), function(index) {
    var collapsible = $(this)
    if (collapsible.height() > 300) {
      collapsible.css("height", "300px")
      collapsible.siblings(".content-more").addClass("active")
    }
  })
}

function init_delayed_blocks(blocks) {
  var delayed_blocks = blocks ? blocks : $(".delayed-block")
  $.each(delayed_blocks, function() {
    var delayed_block = $(this)
    var delay = delayed_block.data("delay")
    setTimeout(function() {
      delayed_block.slideDown()
    }, delay || 400)
  })
}

var alert_unread_messages_bottom_pt =
  '<div class="alert-messages-scroll down">' +
  '<span class="fa fa-long-arrow-down"></span> <span>' +
  novaideo_translate("Unread messages") +
  "</span> " +
  '<span class="fa fa-long-arrow-down"></span></div>'

var alert_unread_messages_top_pt =
  '<div class="alert-messages-scroll top">' +
  '<span class="fa fa-long-arrow-up"></span> <span>' +
  novaideo_translate("Unread messages") +
  "</span> " +
  '<span class="fa fa-long-arrow-up"></span></div>'

function scroll_to_unread_message() {
  var target = $($(this).data("target"))
  var channel_action = $(target.parents(".channel-action").first())
  var scrollable = $(channel_action.parents(".channels-container").first())
  //scroll if mCS
  scrollable.mCustomScrollbar("scrollTo", channel_action, {
    scrollInertia: 200,
    callbacks: {
      onScroll: function() {
        update_unread_messages_alerts()
      }
    }
  })
  //scroll if not mCS
  var top = scrollable.scrollTop() + channel_action.position().top - 100
  scrollable.animate({ scrollTop: top }, 1000)
}

function update_unread_messages_alerts() {
  var channels = $(".channels-container")
  channels.each(function() {
    var has_unread = has_hidden_unread_messages($(this))
    $(
      $(this).parents(".channels-block").find(".alert-messages-scroll")
    ).remove()
    if (has_unread.top) {
      var alert_obj = $(alert_unread_messages_top_pt)
      alert_obj.data("target", "#" + result.target_bottom)
      alert_obj.attr("data-target", "#" + result.target_bottom)
      alert_obj.insertAfter($(this))
    }
    if (has_unread.bottom) {
      var alert_obj = $(alert_unread_messages_bottom_pt)
      alert_obj.data("target", "#" + result.target_top)
      alert_obj.attr("data-target", "#" + result.target_top)
      alert_obj.insertBefore($(this))
    }
  })
}

function has_hidden_unread_messages(channel) {
  var unread = $(channel.find(".channel-action .unread-comments-len"))
  result = { top: false, bottom: false }
  if (unread.length > 0) {
    for (var i = 0; i < unread.length; i++) {
      var element = $($(unread[i]).parents(".channel-action").first())
      var is_visible = is_visible_into_view(element, channel)
      result.top = result.top || !is_visible.top
      result.bottom = result.bottom || !is_visible.bottom
      if (!result.target) {
        if (!is_visible.top) {
          result.target_bottom = $(element.find("a").first()).attr("id")
        }
        if (!is_visible.bottom) {
          result.target_top = $(element.find("a").first()).attr("id")
        }
      }
    }
  }
  return result
}

function is_visible_into_view(elem, scrollable) {
  var docViewTop = 0
  var elemTop = 0
  var mCSB_container = $(scrollable.find(".mCSB_container"))
  if (mCSB_container.length > 0) {
    docViewTop = parseInt(mCSB_container.css("top").replace("px", "")) * -1
    elemTop = $(elem).offset().top - mCSB_container.offset().top
  } else {
    docViewTop = scrollable.scrollTop()
    elemTop = $(elem).position().top
  }
  var docViewBottom = docViewTop + scrollable.height()
  var elemBottom = elemTop + $(elem).height()

  return {
    bottom: elemBottom <= docViewBottom,
    top: elemTop >= docViewTop
  }
}

$(document).on("click", function(event) {
  if (!event.open_explanation) {
    var parents = $(
      $(event.target).parents(".proposal-explanation:not(.closed)")
    )
    if (parents.length == 0) {
      $(".proposal-explanation:not(.closed)").addClass("closed")
    }
  }
  var parents = $($(event.target).parents(".alerts-content"))
  if (parents.length == 0) {
    $(".alerts-content").addClass("hide-bloc")
    $(".alert-block.opened").removeClass("opened")
  }
})

$(document).on("dblclick", "g.node .node-shape, g.node text", open_node_url)

$(document).on("click", ".btn-more-scroll", function() {
  var result_scroll = $($(this).parents(".result-scroll").first())
  result_scroll.infinitescroll("scroll")
})

$(document).on("click", ".full-screen-btn.screen-small", function() {
  var $this = $(this)
  var target_class = $this.data("target")
  var target = target_class
    ? $this.parents(target_class).first()
    : $(".pontus-main")
  target.addClass("full-screen")
  $this
    .removeClass("glyphicon glyphicon-resize-full")
    .addClass("glyphicon glyphicon-resize-small")
  $this.removeClass("screen-small").addClass("full")
  target.removeClass("screen-small").addClass("full")
})

$(document).on("click", ".full-screen-btn.full", function() {
  var $this = $(this)
  var target_class = $this.data("target")
  var target = target_class
    ? $this.parents(target_class).first()
    : $(".pontus-main")
  target.removeClass("full-screen")
  $this
    .removeClass("glyphicon glyphicon-resize-small")
    .addClass("glyphicon glyphicon-resize-full")
  $this.removeClass("full").addClass("screen-small")
  target.removeClass("full").addClass("screen-small")
})

$(document).on("click", ".proposal-opinion", activate_explanation)

$(document).on("click", ".proposal-opinion button.close", close_explanation)

$(document).on("click", ".working-group-toggle", function() {
  var $this = $(this)
  var wg_section_body = $(
    $this
      .parents(".working-group-result")
      .first()
      .find(".working-group-section")
      .first()
  )
  var btn = $($this.find(".working-group-toggle-btn").first())

  if (wg_section_body.hasClass("hide-bloc")) {
    btn.addClass("ion-ios7-arrow-up")
    btn.removeClass(" ion-ios7-arrow-down")
    wg_section_body.removeClass("hide-bloc")
  } else {
    btn.removeClass("ion-ios7-arrow-up")
    btn.addClass(" ion-ios7-arrow-down")
    wg_section_body.addClass("hide-bloc")
  }
})

$(
  document
).on(
  "click",
  ".proposal-support:not(.disabled) .token:not(.disabled)",
  function() {
    var $this = $(this)
    var action_url = $this.data("action")
    var url_attr = get_action_metadata(
      $($this.parents(".proposal-support").first())
    )
    if (action_url) {
      loading_progress()
      $.post(action_url, url_attr, function(data) {
        finish_progress()
        data.token_action = $this.hasClass("token-success")
          ? "token-success"
          : "token-danger"
        update_components(data)
      })
    }
  }
)

$(document).on("click", ".sidebar-nav li > a.primary", function(event) {
  var $this = $(this)
  if (!event.internal) {
    $this.addClass("current")
    var menuevent = jQuery.Event("click")
    menuevent.internal = true
    $(".sidebar-nav li > a.primary.active-item:not(.current)").trigger(
      menuevent
    )
    $this.removeClass("current")
  }
  var iconstate = $($this.find("span.icon-state"))
  if (iconstate.hasClass("ion-chevron-down")) {
    iconstate.addClass("ion-chevron-up").removeClass("ion-chevron-down")
  } else {
    iconstate.addClass("ion-chevron-down").removeClass("ion-chevron-up")
  }
  if ($this.hasClass("active-item")) {
    $this.removeClass("active-item")
  } else {
    $this.addClass("active-item")
  }
})

$(document).on("click", ".sidebar-background.toggled", function() {
  $(".menu-toggle.close").click()
  $($(this).find(".comment-form-group.active")).removeClass("active")
})

$(document).on("click", ".sidebar-right-background.toggled", function() {
  $(".menu-right-toggle.close").click()
  $(".dace-action-sidebar.activated").removeClass("activated")
  $("body").removeClass("modal-open")
  $(".sidebar-right-wrapper .sidebar-container>.container-body").html("")
})

$(
  document
).on(
  "click",
  ".smartfolder-nav li >.item-container > span.icon-state",
  function(event) {
    var $this = $(this)
    if ($this.hasClass("ion-chevron-up")) {
      $this.addClass("ion-chevron-down").removeClass("ion-chevron-up")
    } else {
      $this.addClass("ion-chevron-up").removeClass("ion-chevron-down")
    }
  }
)

$(document).on("click", ".content-more-message", function() {
  var more_btn = $(this).parents(".content-more").first()
  var content = more_btn.siblings(".content-collapsible")
  more_btn.removeClass("active")
  content.css("height", "inherit")
})

$(document).on("change", ".is-restricted-input input", function() {
  var $this = $(this)
  var form = $this.parents("form").first()
  $(form.find(".invitedusers-input")).toggleClass("closed")
})

$(document).on("click", 'form .btn[type="submit"]', function(event) {
  var $this = $(this)
  $this.parents("form").find('.btn[type="submit"]').removeClass("active")
  $this.addClass("active")
})

$(document).on("click", ".all-channels-toggle", function(e) {
  e.preventDefault()
  $(".all-channels").toggleClass("toggled")
  reset_cookie_channels_bar()
})

$(document).on("click", ".challenges-container .challenges-header", function(
  e
) {
  e.preventDefault()
  var $this = $(this)
  var container = $this.parents(".challenges-container").first()
  var isOpened = container.hasClass("opened")
  var items = container.find(".challenges-items")
  if (isOpened) {
    $this
      .find(".icon-activator")
      .removeClass("glyphicon-menu-up")
      .addClass("glyphicon-menu-down")
    items.slideUp("fast", function() {
      container.toggleClass("opened")
    })
  } else {
    $this
      .find(".icon-activator")
      .removeClass("glyphicon-menu-down")
      .addClass("glyphicon-menu-up")
    items.slideDown("fast", function() {
      container.toggleClass("opened")
      container.find(".challenges-bloc").slick("refresh")
    })
  }
  reset_cookie_challenges_bar(isOpened)
})

$(document).on("hide.bs.collapse", ".panel-collapse", function() {
  $(this)
    .siblings()
    .find("a span.glyphicon-minus")
    .attr("class", "glyphicon glyphicon-plus")
})

$(document).on("shown.bs.collapse", ".panel-collapse", function() {
  $(this)
    .siblings()
    .find("a span.glyphicon-plus")
    .attr("class", "glyphicon glyphicon-minus")
})

$(document).on("click", ".alert-block:not(.opened)>span.icon", function(event) {
  var $this = $(this).parents(".alert-block").first()
  var url = $this.data("url")
  var alert_content = $($this.find(".alerts-content").first())
  var target = $(alert_content.find(".content").first())
  alert_content.find(".loading-indicator").removeClass("hide-bloc")
  alert_content.removeClass("hide-bloc")
  $.getJSON(url, {}, function(data) {
    if (data["body"]) {
      target.html(data["body"])
      alert_content.find(".loading-indicator").addClass("hide-bloc")
      $this.addClass("opened")
      unsubscribe_user_from_alerts($this)
    }
  })
  event.stopPropagation()
})

$(document).on("show.bs.modal", ".similar-ideas", function() {
  $("body").addClass("similar-ideas-modal-open")
})

$(document).on("hidden.bs.modal", ".similar-ideas", function() {
  $("body").removeClass("similar-ideas-modal-open")
})

$(document).on("click", "ul.judgment-radio .radio", function() {
  $($(this).find("input")).prop("checked", true)
})

$(document).on("mouseover", ".toggle-popover:not(.active)", function() {
  var $this = $(this)
  $(".comme-popover").remove()
  $this.addClass("active")
  var body = $(document.body)
  var url = body.data("api_url")
  var oid = $this.data("oid")
  setTimeout(function() {
    var has_popover = $this.find(".popover").length > 0
    if ($this.hasClass("active") && !has_popover) {
      $.getJSON(url, { oid: oid, op: "get_entity_popover" }, function(data) {
        if (data["body"]) {
          var popover = $(data["body"])
          $this.append(popover)
          var position = $this.offset()
          popover.css(
            "top",
            position.top -
              $(document).scrollTop() -
              popover.outerHeight() / 2 +
              5 +
              "px"
          )
          popover.css("left", position.left + $this.outerWidth() - 10 + "px")
          popover.css("display", "block")
        }
      })
    }
  }, 900)
})

$(document).on("mouseleave", ".toggle-popover.active", function() {
  var $this = $(this)
  var oid = $this.data("oid")
  $this.removeClass("active")
  $(".comme-popover").remove()
})

$(
  document
).on(
  "click",
  "a.popover-title-link, .popover-content>.popover-text a",
  function(event) {
    event.stopPropagation()
  }
)

$(document).on("click", "a.emoji-group-tab", function() {
  var $this = $(this)
  $("a.emoji-group-tab").removeClass("active")
  $this.addClass("active")
  var group_id = $this.data("group_id")
  var container = $(
    $this.parents(".emoji-anchors").siblings(".emoji-groups").first()
  )
  var group = $(container.find("#" + group_id).first())
  var mCSB_container = $(container.find(".mCSB_container").first())
  if (mCSB_container.length > 0) {
    container.mCustomScrollbar("scrollTo", group.position().top)
  } else {
    var top = container.scrollTop() + group.position().top - 20
    container.animate({ scrollTop: top }, 800)
  }
})

$(document).on("mouseover", ".emoji-groups .emoji-outer", function() {
  var $this = $(this)
  var groups = $($this.parents(".emoji-groups").first())
  var preview = $(groups.siblings(".emoji-preview").first())
  var img = $($this.find(".emoji-inner").first())
  preview.find(".emoji-preview-img").html(img.clone())
  preview
    .find(".emoji-preview-title")
    .html(img.attr("title").replace(/-|_/g, " "))
  preview.find(".emoji-preview-symbol").html(":" + img.attr("title") + ":")
})

$(document).on("mouseleave", ".emoji-groups .emoji-outer", function() {
  var $this = $(this)
  var groups = $($this.parents(".emoji-groups").first())
  var preview = $(groups.siblings(".emoji-preview").first())
  preview.find(".emoji-preview-img").html("")
  preview.find(".emoji-preview-title").html("Emoji")
  preview.find(".emoji-preview-symbol").html("")
})

$(document).on("click", ".files-block .deform-seq-add", function() {
  $(
    $(this).parents(".files-block").first().find('input[type="file"]').last()
  ).click()
})

$(document).on("change", '.files-block input[type="file"]', function() {
  $($(this).parents(".deform-seq-item").first()).addClass("uploaded")
})

$(document).on("click", '.files-block form button[type="submit"]', function() {
  $(
    $(this)
      .parents("form")
      .first()
      .find(".deform-seq-item:not(.uploaded)")
      .find(".deform-close-button")
  ).click()
})

$(document).on("click", "a.channel-action", function() {
  var channel_action = $($(this).parents("div.channel-action").first())
  $(channel_action.find(".unread-comments-len")).remove()
  channel_action.removeClass("unread-comments")
  update_unread_messages_alerts()
  alert_user_unread_messages()
})

$(document).on("click", ".images-container .image-item", display_carousel)

$(document).on("click", ".alert-messages-scroll", scroll_to_unread_message)

$(document).on("component_loaded", function(event, component_id) {
  if (component_id == "novaideo_see_channels") {
    init_channels_scroll()
    alert_user_unread_messages()
    update_unread_messages_alerts()
  }
})

$(document).on("click", ".collapsible-activator:not(.activated)", function(
  event,
  component_id
) {
  var activator = $(this)
  activator.nextAll().not(activator.next()).slideUp("fast")
  activator.addClass("activated glyphicon-triangle-bottom")
  activator.removeClass("glyphicon-triangle-top")
})

$(document).on("click", ".collapsible-activator.activated", function(
  event,
  component_id
) {
  var activator = $(this)
  activator.nextAll().not(activator.next()).slideDown()
  activator.removeClass("activated glyphicon-triangle-bottom")
  activator.addClass("glyphicon-triangle-top")
})

$(document).on("click", ".stat-container", function() {
  $(this).toggleClass("stat-details")
})

$(window).load(function() {
  initscroll()
})

$(window).scroll(function() {
  init_card_position()
})

$(document).ready(function() {
  $(".challenges-bloc").slick({
    dots: false,
    infinite: false,
    speed: 400,
    slidesToShow: 3,
    slidesToScroll: 3,
    responsive: [
      {
        breakpoint: 1600,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 2,
          dots: false
        }
      },
      {
        breakpoint: 630,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          dots: false
        }
      }
      // You can unslick at a given breakpoint now by adding:
      // settings: "unslick"
      // instead of a settings object
    ]
  })
  init_collapsible_contents()

  init_emoji($(".emoji-container:not(.emojified)"))

  rebuild_scrolls()

  set_visited()

  init_morecontent_scroll()

  init_card_position()

  scroll_to_panel()

  $.notify.addStyle("bootstrap", {
    html:
      "<div><span data-notify-html='icon'/> <span data-notify-text='text'/></div>"
  })

  $(".menu-toggle").click(function(e) {
    e.preventDefault()
    $(".bar-wrapper").toggleClass("toggled")
    $(".sidebar-background").toggleClass("toggled")
  })

  $(".menu-right-toggle").click(function(e) {
    e.preventDefault()
    var bar = $(".bar-right-wrapper")
    var open = bar.hasClass("toggled")
    bar.toggleClass("toggled")
    $(".sidebar-right-background").toggleClass("toggled")
    $("body").toggleClass("modal-open")
    if (!open) {
      $(".dace-action-sidebar.activated").removeClass("activated")
      $(bar.find(".comment-form-group.active")).removeClass("active")
      $(".sidebar-right-wrapper .sidebar-container>.container-body").html("")
    }
  })

  $(".navbar-toggle.collapsed").on("click", collapse_current_collpsein)

  $("input, textarea").placeholder()

  $("nav a nav-control").on("click", function() {
    $(".navbar-toggle").click()
  })

  $(".btn-sub-menu-container").hover(
    function() {
      var $this = $(this)
      $this.addClass("active")
      $($this.find("ul.btn-sub-menu li")).fadeIn("fast")
      $(document.body).append(
        '<div class="modal-backdrop fade in modal-sub-menu"></div>'
      )
    },
    function() {
      var $this = $(this)
      $this.removeClass("active")
      $(".modal-sub-menu").remove()
      $($this.find("ul.btn-sub-menu li")).fadeOut("fast")
    }
  )

  init_collapsible()

  init_delayed_blocks()

  focus_on_form($(".pontus-main"))
})
