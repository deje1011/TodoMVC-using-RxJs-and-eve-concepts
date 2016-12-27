# TodoMVC using RxJs and "eve-concepts"

After watching another episode of funfunfunction (https://www.youtube.com/watch?v=aJpBYow99Ag),
I took a look at the programming language eve (http://play.witheve.com/#/examples/quickstart.eve) and was very impressed by their concepts. 
However, I couldn't really get much eve code to work even if I would just copy & paste the examples... So I tried to emulate
the 3 main operators: Commit, Search and Bind. The result is yet another TodoMVC application (http://todomvc.com/).

# Requirements / Choices

* search => The results had to be "live" and composable => RxJs
* bind@browser => some rendering/templating engine => Ractive (because it was so trivial to implement)
* commit => stores data and informs observers => Rx.BehaviorSubject


In the end RxJs kind of took over the whole thing and the eve part of it is rather small...
But at least some concepts are still there. For example the order of the code blocks in main.js does not matter.
