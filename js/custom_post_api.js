jQuery(document).ready(function($) {
    'use strict';
    // #submit
    $('#ff-submit-119400280').on('click', function() {
      
      // 暱稱
      var name = $('[name="entry.1068526554"]').val() || '未填寫';





      // 性別
    //   var sex = function() {
    //     var v;
    //     $('[name="demo_radio"]').each(function() {
    //       if($(this).prop('checked') === true) v = $(this).val();
    //     });
    //     return v;
    //   };

    //   // 類別
    //   var cat = $('#demo_select').val() || '未填寫';

    //   // 內容
    //   var msg = $('#demo_textarea').val() || '未填寫';

      // post
      var data = {
        'entry.1068526554': name,
        // 'entry.1569038925': sex(),
        // 'entry.1509045370': cat,
        // 'entry.758411200': msg
      };
      var test_data = {
        'entry.1068526554': '7. Oct',
        'entry.883070371': 'that@gmail',
        'entry.1053365713': '123',
        'entry.1395581871': 'what',
        'entry.1970291756': 'OK',
        'entry.1841292804': '沒問題！',
        'entry.451787920': '銀行轉帳',
        'entry.918817329': '2',
        'entry.1230811956': '2',
        'entry.1122819681': '2',
        'entry.1946631460': '2',
        'entry.1036346855': '1',
        'entry.1797326934': '2',
        'entry.347979567': '2',
        'entry.575052231': '5386',
        'entry.253014823': '13',
        'entry.1423911485': '1125',
        'entry.1725694623': '6511',
        'entry.18356239': '非常希望！！很期待在ST的帶領下完美體驗沈浸式婚禮',
        'entry.1286001326': '知道了！',
        'entry.746776974': '知道了！',
        'entry.450550785': '當然啦！！！',
        'entry.1160286542': 'OFC，聰明絕頂的我',
      }
  
      
    });
  });
