describe("PromiseStream", function() {
  'use strict';
  var deferred;
  var data;

  beforeEach(function() {
    mockPromises.install(Q.makePromise);
    mockPromises.reset();
    deferred = Q.defer();
    data = promiseStream(function(){
      return deferred.promise;
    });
  });

  it("should call the load function with the passed arguments", function(){

    var promiseFactory = jasmine.createSpy('promiseFactory').and.returnValue(deferred.promise);
    var data = promiseStream(promiseFactory);
    data.load(1, 2, 'la');
    expect(promiseFactory).toHaveBeenCalledWith(1, 2, 'la');
    expect(data.lastRequestArguments).toEqual([1, 2, 'la']);
  });

  describe("should trigger ", function(){

    var successCb;
    var failureCb;
    var finalyCb;
    var loadPromise;

    beforeEach(function(){
      successCb = jasmine.createSpy('successCb');
      failureCb = jasmine.createSpy('failureCb');
      finalyCb = jasmine.createSpy('finalyCb');

      data.then(successCb, failureCb, finalyCb);
      loadPromise = data.load();

      expect(successCb).not.toHaveBeenCalled();
      expect(failureCb).not.toHaveBeenCalled();
      expect(finalyCb).not.toHaveBeenCalled();
    });

    it("the resolved success callback", function() {

      deferred.resolve([1,2]);

      mockPromises.executeForPromise(deferred.promise);
      mockPromises.executeForPromise(loadPromise);

      expect(successCb).toHaveBeenCalledWith([1,2]);
      expect(failureCb).not.toHaveBeenCalled();
      expect(finalyCb).toHaveBeenCalledWith();

    });

    it("the resolved failure callback", function() {
      deferred.reject('not happening');

      mockPromises.executeForPromise(deferred.promise);
      mockPromises.executeForPromise(loadPromise);

      expect(successCb).not.toHaveBeenCalled();
      expect(failureCb).toHaveBeenCalledWith('not happening');
      expect(finalyCb).toHaveBeenCalledWith();

    });
  });

  describe('with chained \'resolved\' should', function(){

    var successCb;
    var failureCb;
    var finalyCb;
    var loadPromise;

    beforeEach(function(){
      successCb = jasmine.createSpy('successCb');
      failureCb = jasmine.createSpy('failureCb');
      finalyCb = jasmine.createSpy('finalyCb');
    });

    describe('propagate the original data if no callbacks are added to the first \'resolved\'', function(){

      beforeEach(function(){
        data
        .then()
        .then(successCb, failureCb, finalyCb);
        loadPromise = data.load();
      });

      it('on success', function(){

        deferred.resolve(5);

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);

        expect(successCb).toHaveBeenCalledWith(5);
        expect(failureCb).not.toHaveBeenCalled();
        expect(finalyCb).toHaveBeenCalledWith();

      });

      it('on failure', function(){

        deferred.reject('no');

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);

        expect(successCb).not.toHaveBeenCalled();
        expect(failureCb).toHaveBeenCalledWith('no');
        expect(finalyCb).toHaveBeenCalledWith();

      });

    });

    describe('propagate the returned data of the callbacks of the first \'resolved\'', function(){
      var successData;
      var failureData;

      beforeEach(function(){
        data
        .then(function(){
          return successData;
        }, function (){
          return failureData;
        }, function(){
        })
        .then(successCb, failureCb, finalyCb);
        loadPromise = data.load();

      });

      it('on success', function(){

        successData = 2;
        deferred.resolve(5);

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);

        expect(successCb).toHaveBeenCalledWith(2);
        expect(failureCb).not.toHaveBeenCalled();
        expect(finalyCb).toHaveBeenCalledWith();

      });

      it('on failure', function(){

        failureData = 'fail';
        deferred.reject('no');

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);


        expect(successCb).not.toHaveBeenCalled();
        expect(failureCb).toHaveBeenCalledWith('fail');
        expect(finalyCb).toHaveBeenCalledWith();

      });
    });




  });

  describe('with doubly chained \'resolved\' should', function() {

    var successCb;
    var failureCb;
    var finalyCb;
    var loadPromise;

    beforeEach(function () {
      successCb = jasmine.createSpy('successCb');
      failureCb = jasmine.createSpy('failureCb');
      finalyCb = jasmine.createSpy('finalyCb');
    });

    describe('propagate the returned data of the callbacks of the second \'resolved\'', function () {

      describe('when callbacks are added in the first \'resolved\'', function(){
        var successData;
        var failureData;
        var secondSuccessData;
        var secondFailureData;

        beforeEach(function () {
          data
          .then(function () {
            return successData;
          }, function () {
            return failureData;
          }, function () {
          })
          .then(function(){
            return secondSuccessData;
          }, function(){
            return secondFailureData;
          })
          .then(successCb, failureCb, finalyCb);
          loadPromise = data.load();

        });
        it('on success', function(){

          secondSuccessData = 2;
          deferred.resolve(5);

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(loadPromise);

          expect(successCb).toHaveBeenCalledWith(2);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalledWith();

        });

        it('on failure', function(){

          secondFailureData = 'fail';
          deferred.reject('no');

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(loadPromise);


          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).toHaveBeenCalledWith('fail');
          expect(finalyCb).toHaveBeenCalledWith();

        });
      });

      describe('when no callbacks are added on first \'resolved\'', function(){

        var secondSuccessData;
        var secondFailureData;

        beforeEach(function () {
          data
          .then()
          .then(function(){
            return secondSuccessData;
          }, function(){
            return secondFailureData;
          })
          .then(successCb, failureCb, finalyCb);
          loadPromise = data.load();

        });
        it('on success', function(){

          secondSuccessData = 2;
          deferred.resolve(5);

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(loadPromise);

          expect(successCb).toHaveBeenCalledWith(2);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalledWith();

        });

        it('on failure', function(){

          secondFailureData = 'fail';
          deferred.reject('no');

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(loadPromise);


          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).toHaveBeenCalledWith('fail');
          expect(finalyCb).toHaveBeenCalledWith();

        });
      });


    });

    describe('propagate the returned data of the callbacks of the first \'resolved\'', function () {

      var successData;
      var failureData;

      beforeEach(function () {
        data
        .then(function () {
          return successData;
        }, function () {
          return failureData;
        }, function () {
        })
        .then()
        .then(successCb, failureCb, finalyCb);
        loadPromise = data.load();

      });
      it('on success', function(){

        successData = 2;
        deferred.resolve(5);

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);

        expect(successCb).toHaveBeenCalledWith(2);
        expect(failureCb).not.toHaveBeenCalled();
        expect(finalyCb).toHaveBeenCalledWith();

      });

      it('on failure', function(){

        failureData = 'fail';
        deferred.reject('no');

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);


        expect(successCb).not.toHaveBeenCalled();
        expect(failureCb).toHaveBeenCalledWith('fail');
        expect(finalyCb).toHaveBeenCalledWith();

      });

    });

    describe('propagate the original data if no callbacks are added', function () {

      beforeEach(function () {
        data
        .then()
        .then()
        .then(successCb, failureCb, finalyCb);
        loadPromise = data.load();

      });
      it('on success', function(){

        deferred.resolve(5);

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);

        expect(successCb).toHaveBeenCalledWith(5);
        expect(failureCb).not.toHaveBeenCalled();
        expect(finalyCb).toHaveBeenCalledWith();

      });

      it('on failure', function(){

        deferred.reject('no');

        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(loadPromise);


        expect(successCb).not.toHaveBeenCalled();
        expect(failureCb).toHaveBeenCalledWith('no');
        expect(finalyCb).toHaveBeenCalledWith();

      });

    });


  });

  it('\'load\' should throw Error when no promise is returned', function(){

    var data = promiseStream(2);

    expect(data.load).toThrow();

  });


  describe('requested signals', function(){

    var loadingCb1, loadingCb2, loadingCb3;


    beforeEach(function(){
      loadingCb1 = jasmine.createSpy('loadingCb1');
      loadingCb2 = jasmine.createSpy('loadingCb2');
      loadingCb3 = jasmine.createSpy('loadingCb3');
    });

    it('should be triggered for all chained results', function(){
      data.requested(loadingCb1);
      var data2 = data.then();
      data2.requested(loadingCb2);
      var data3 = data2.then();
      data3.requested(loadingCb3);
      data.load();

      expect(data.isLoading).toBe(true);
      expect(data2.isLoading).toBe(true);
      expect(data3.isLoading).toBe(true);

      expect(loadingCb1).toHaveBeenCalled();
      expect(loadingCb2).toHaveBeenCalled();
      expect(loadingCb3).toHaveBeenCalled();
    });

    it('should be possible to chain', function(){
      data.requested(loadingCb1)
      .then()
      .requested(loadingCb2)
      .then()
      .requested(loadingCb3);
      data.load();

      expect(loadingCb1).toHaveBeenCalled();
      expect(loadingCb2).toHaveBeenCalled();
      expect(loadingCb3).toHaveBeenCalled();
    });

    it('should propagate to combined PromiseStream', function(){


      var combined = promiseStream.all(data);
      combined.requested(loadingCb1);
      var last = combined.then().requested(loadingCb2);

      data.load();
      expect(combined.isLoading).toEqual(true);
      expect(last.isLoading).toEqual(true);
      expect(loadingCb1).toHaveBeenCalled();
      expect(loadingCb2).toHaveBeenCalled();


    })
  });

  describe('\'resolved\' should be immediately triggered for a chained result if the source has already been loaded', function(){

    var successCb;
    var failureCb;
    var finalyCb;
    var loadPromise;
    var successData = [1,2];

    beforeEach(function(){
      successCb = jasmine.createSpy('successCb');
      failureCb = jasmine.createSpy('failureCb');
      finalyCb = jasmine.createSpy('finalyCb');

      loadPromise = data.load();
      deferred.resolve(successData);
      mockPromises.executeForPromise(deferred.promise);
      mockPromises.executeForPromise(loadPromise);

    });

    it('for one chained result', function(){

      var result;
      data.then(function(data){
        result = data;
      });
      expect(result).toEqual(successData);
    });

    it('for two chained results', function(){

      var result;
      var data2 = data.then();
      data2.then(function(data){
        result = data;
      });

      expect(result).toEqual(successData);
    });

    it('for two chained results with intermediate result', function(){

      var result;
      var data2 = data.then(function(){
        return 2;
      });
      data2.then(function(data){
        result = data;
      });

      expect(result).toEqual(2);
    });

  });

  it('second \'load\' should retrigger resolved', function(){

    var successCb1 = jasmine.createSpy('successCb1');
    var successCb2 = jasmine.createSpy('successCb2');

    data.then(successCb1).then(successCb2);

    var loadPromise = data.load();
    deferred.resolve(2);
    mockPromises.executeForPromise(deferred.promise);
    mockPromises.executeForPromise(loadPromise);

    expect(successCb1.calls.count()).toEqual(1);
    expect(successCb2.calls.count()).toEqual(1);


    loadPromise = data.load();
    mockPromises.executeForPromise(deferred.promise);
    mockPromises.executeForPromise(loadPromise);

    expect(successCb1.calls.count()).toEqual(2);
    expect(successCb2.calls.count()).toEqual(2);

  });

  describe('all()', function(){

    var deferred2, data2;

    beforeEach(function() {
      deferred2 = Q.defer();
      data2 = promiseStream(function(){
        return deferred2.promise;
      });
    });

    it('should return an PromiseStream', function(){
      var combined = promiseStream.all(data, data2)
      expect(combined.requested).toBeDefined();
      expect(combined.then).toBeDefined();
    });

    describe('combined PromiseStream', function(){

      var combined, successCb, failureCb, finalyCb, requestCb;

      beforeEach(function() {
        combined = promiseStream.all(data, data2);

        successCb = jasmine.createSpy('successCb');
        failureCb = jasmine.createSpy('failureCb');
        finalyCb = jasmine.createSpy('finalyCb');
        requestCb = jasmine.createSpy('requestCb');
      });

      describe('resolved callback', function(){

        beforeEach(function(){
          combined.then(successCb, failureCb, finalyCb);

          data.load();
          data2.load();

          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).not.toHaveBeenCalled();
        });

        it('should be triggered when both source signals are resolved', function(){

          deferred.resolve([5, 6]);
          deferred2.resolve('lala');

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb).toHaveBeenCalledWith([[5, 6]], ['lala']);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalled();
        });

        it('should be triggered a second time when at least one source signal is resolved', function(){
          deferred.resolve([5, 6]);
          deferred2.resolve('lala');

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb.calls.count()).toEqual(1);
          expect(finalyCb.calls.count()).toEqual(1);

          data2.load();
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb).toHaveBeenCalledWith([[5, 6]], ['lala']);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalled();

          expect(successCb.calls.count()).toEqual(2);
          expect(finalyCb.calls.count()).toEqual(2);
        });

        it('should not be triggered when only one source signals is resolved', function(){

          deferred.resolve([5, 6]);

          mockPromises.executeForPromise(deferred.promise);

          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).not.toHaveBeenCalled();
        });

        it('should be triggered when at least one source signals is rejected', function(){

          deferred.reject('pwned');

          mockPromises.executeForPromise(deferred.promise);

          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).toHaveBeenCalledWith('pwned');
          expect(finalyCb).toHaveBeenCalled();
        });
      });

      describe('requested callback', function(){

        beforeEach(function(){
          combined.requested(requestCb);
        });

        it('should be triggered when at least one source signal is loaded', function(){
          data2.load();

          expect(combined.isLoading).toEqual(true);
          expect(requestCb).toHaveBeenCalled();

        });

      });

      describe('with chained resolved', function(){

        it('should propagate requested to the chained PromiseStream', function(){
          var requestCb2 = jasmine.createSpy('requestCb2');
          var result1 = combined.
            then().
            requested(requestCb);
          var result2 = result1.
            then(function(){
              return 6;
            }).
            requested(requestCb2);

          data.load();
          expect(result1.isLoading).toEqual(true);
          expect(result2.isLoading).toEqual(true);
          expect(requestCb).toHaveBeenCalled();
          expect(requestCb2).toHaveBeenCalled();

        });

        it('should propagate arguments without intermediate results', function(){

          combined.then()
            .then(successCb, failureCb, finalyCb);

          deferred.resolve([5, 6]);
          deferred2.resolve('lala');
          data.load();
          data2.load();

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb).toHaveBeenCalledWith([[5, 6]], ['lala']);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalled();

        });

        it('should propagate success arguments with intermediate results', function(){

          combined
            .then(function(){
              return 5;
            })
            .then(successCb, failureCb, finalyCb);

          deferred.resolve([5, 6]);
          deferred2.resolve('lala');
          data.load();
          data2.load();

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb).toHaveBeenCalledWith(5);
          expect(failureCb).not.toHaveBeenCalled();
          expect(finalyCb).toHaveBeenCalled();

        });

        it('should propagate rejection arguments with intermediate results', function(){

          combined
            .then(null, function(){
              return 'failed';
            })
            .then(successCb, failureCb, finalyCb);

          deferred.resolve([5, 6]);
          deferred2.reject('lala');
          data.load();
          data2.load();

          mockPromises.executeForPromise(deferred.promise);
          mockPromises.executeForPromise(deferred2.promise);

          expect(successCb).not.toHaveBeenCalled();
          expect(failureCb).toHaveBeenCalledWith('failed');
          expect(finalyCb).toHaveBeenCalled();

        });


      });

      it('should trigger resolved when attached late', function(){

        deferred.resolve([5, 6]);
        deferred2.resolve('lala');
        data.load();
        data2.load();
        mockPromises.executeForPromise(deferred.promise);
        mockPromises.executeForPromise(deferred2.promise);

        combined.then(successCb, failureCb, finalyCb);

        expect(successCb).toHaveBeenCalledWith([[5, 6]], ['lala']);
        expect(failureCb).not.toHaveBeenCalled();
        expect(finalyCb).toHaveBeenCalled();

      })
    });
  });

  it('should trigger multiple parallel resolved', function(){

    // this test triggers a bug caused by writing a for loop as
    // `for(i = 0; ...)` instead of `for(var i = 0; ...)`
    // (notice the `var` missing)
    var successCb1 = jasmine.createSpy('successCb1');
    var successCb2 = jasmine.createSpy('successCb2');
    var successCb3 = jasmine.createSpy('successCb3');
    var successCb4 = jasmine.createSpy('successCb4');

    data.then(successCb1);
    data.then(successCb2);
    data.then(successCb3);
    data.then(successCb4);

    data.load();
    deferred.resolve([1,2]);
    mockPromises.executeForPromise(deferred.promise);

    expect(successCb1).toHaveBeenCalledWith([1,2]);
    expect(successCb1).toHaveBeenCalledWith([1,2]);
    expect(successCb1).toHaveBeenCalledWith([1,2]);
    expect(successCb1).toHaveBeenCalledWith([1,2]);

  });
});
