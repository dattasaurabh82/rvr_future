var domAnimator = new DomAnimator();

var frame1 = ['     _I_      ',
              '    /o o\\    ',
              '    | - |     ',
              '   -------    ',
              '  /|     |\\  ',
              ' / |_____| \\ ',
              '      |       ',
              '     {0}      '
              ];

var frame2 = ['     _I_      ',
              '    /  o\\    ',
              '    |  .|     ',
              '   -------    ',
              '   |    /|    ',
              '   |___/_|    ',
              '      /       ',
              '    {@}       '
              ];

var frame3 = ['       _I_      ',
              '      /  o\\    ',
              '      |  .|     ',
              '     -------    ',
              '     |    /|    ',
              '     |___/_|    ',
              '        /       ',
              '      {@}       '
              ];
var frame3 = ['         _I_      ',
              '        /  o\\    ',
              '        |  .|     ',
              '       -------    ',
              '       |    /|    ',
              '       |___/_|    ',
              '          /       ',
              '        {@}       '
              ];
var frame3 = ['              _I_      ',
              '             /  o\\    ',
              '             |  .|     ',
              '            -------    ',
              '            |    /|    ',
              '            |___/_|    ',
              '               /       ',
              '             {@}       '
              ];
var frame4 = ['              _I_      ',
              '             /o o\\    ',
              '             | - |     ',
              '            -------    ',
              '           /|     |\\  ',
              '          / |_____| \\ ',
              '               |       ',
              '              {0}      '
              ];

var frame5 = ['              _I_      ',
              '             /o  \\    ',
              '             |.  |     ',
              '            -------    ',
              '            |\\     |  ',
              '            |_\\ ___|  ',
              '               \\      ',
              '               {@}     '
              ];

var frame6 = ['           _I_      ',
              '          /o  \\    ',
              '          |.  |     ',
              '         -------    ',
              '         |\\     |  ',
              '         |_\\ ___|  ',
              '            \\      ',
              '            {@}     '
              ];


var frame7 = ['       _I_      ',
              '      /o  \\    ',
              '      |.  |     ',
              '     -------    ',
              '     |\\     |  ',
              '     |_\\ ___|  ',
              '        \\      ',
              '        {@}     '
              ];


domAnimator.addFrame(frame1);
domAnimator.addFrame(frame2);
domAnimator.addFrame(frame3);
domAnimator.addFrame(frame4);
domAnimator.addFrame(frame5);
domAnimator.addFrame(frame6);
domAnimator.addFrame(frame7);
domAnimator.animate(150);