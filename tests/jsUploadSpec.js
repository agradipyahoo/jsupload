/**
 * Created by agradip.sarkar on 11/12/14.
 */
define(['underscore', 'jsUpload'], function () {

    describe('Check JSUpload Instantiation', function () {
        var settings = {}, jsUpload, fileInput;
        beforeEach(function () {
            var logFunction = function () {
                console.log(arguments);
            }
            settings = {
                post_params: {
                    cxrfToken: 'testtoken'
                },
                upload_url: '/upload.html',
                file_size_limit: "100 MB",
                file_types: "image/*",
                file_queue_limit: 100,
                // Button settings
                button_placeholder_id: 'button_text_id',
                file_dialog_start_handler: function () {
                    console.log('called file_dialog_start_handler ', arguments);

                },
                file_dialog_complete_handler: function fileDialogComplete(numFilesSelected, numFilesQueued) {
                    console.log("file_dialog_complete_handler", arguments);
                },
                // The event handler functions are defined in handlers.js
                file_queued_handler: function (file) {
                    console.log("file_queued_handler", file);
                },
                file_queue_error_handler: logFunction,
                upload_start_handler: function upload_start_handler(file) {
                    console.log('upload_start_handler', arguments, this);
                },
                upload_progress_handler: function upload_progress_handler() {
                    console.log("upload_progress_handler", arguments);
                },
                upload_error_handler: function upload_error_handler(file, errorCode) {
                    console.log("upload_error_handler", arguments);
                },
                upload_success_handler: function upload_success_handler(file, serverData) {
                    console.log("upload_success_handler", arguments);
                },
                upload_complete_handler: function upload_complete_handler() {
                    console.log('upload_complete_handler', arguments);
                },
                queue_complete_handler: function () {
                    console.log('queue_complete_handler', arguments);
                }

            };

            jsUpload = new JSUpload(settings);
            fileInput = $(jsUpload.input)[0];
//            var timerCallback;
//            beforeEach(function () {
//                this.clock = sinon.useFakeTimers();
//            });
//
//            afterEach(function () {
//                this.clock.restore();
//            });
        });

        it('is jsupload instance exist', function () {
            expect(jsUpload).toBeDefined();
        });

        it('is jsupload has input type file', function () {
            expect(fileInput).toHaveAttr('type', 'file');
        });

        it('is jsupload has valid accept type based on settings', function () {
            expect(fileInput).toHaveAttr('accept', settings.file_types);
        });

        it('is jsupload allow multiple file upload based on settings', function () {
            expect(fileInput).toHaveAttr('multiple', 'multiple');
        });

        describe('trigger change handler on file upload component', function () {
            var file = {
                name: "test.png",
                size: 500001,
                type: "image/png"
            };

            var fileList = {
                0: file,
                length: 1,
                item: function (index) {
                    return file;
                }
            };


            beforeEach(function () {

                this.queueSpy =  sinon.spy(jsUpload.settings ,'file_queued_handler');
                this.validateSpy = sinon.spy(jsUpload , 'validate');
                this.validateFileTypeSpy = sinon.spy(jsUpload,'validateFileType');
                this.validateFileSizeSpy = sinon.spy(jsUpload,'validateFileSize');
                this.dialogCSpy = sinon.spy(settings,'file_dialog_complete_handler');
                $(fileInput).triggerHandler({
                    type: 'change',
                    target: {
                        files: fileList
                    }
                });
            });

            it('File Queue Handler called with arguments', function () {
                expect(this.queueSpy.called).toBeTruthy();
                expect(this.queueSpy.calledOnce).toBeTruthy();
                expect(this.queueSpy.calledWithExactly(file)).toBeTruthy();
            });

            it('File Complete Handler with arguments', function () {
                expect(this.dialogCSpy.called).toBeTruthy();
                expect(this.dialogCSpy.calledOnce).toBeTruthy();
                expect(this.dialogCSpy.calledWith(1,1)).toBeTruthy();
            });

            it('Validate function called', function () {
                expect(this.validateSpy.called).toBeTruthy();
                expect(this.validateSpy.calledOnce).toBeTruthy();
                expect(this.validateSpy.calledWith(file)).toBeTruthy();
                expect(this.validateSpy.returnValues[0]).toEqual(0);
            });

            it('File Type validator called', function () {
                expect(this.validateFileTypeSpy.called).toBeTruthy();
                expect(this.validateFileTypeSpy.calledOnce).toBeTruthy();
                expect(this.validateFileTypeSpy.calledWith(file)).toBeTruthy();
                expect(this.validateFileTypeSpy.returnValues[0].error).toBeFalsy();
            });

            it('File Size validator called', function () {
                expect(this.validateFileSizeSpy.called).toBeTruthy();
                expect(this.validateFileSizeSpy.calledOnce).toBeTruthy();
                expect(this.validateFileSizeSpy.calledWith(file)).toBeTruthy();
                expect(this.validateFileSizeSpy.returnValues[0].error).toBeFalsy();
            });

            it('Validate Number of files quequed should less than 100', function () {
                expect(jsUpload.fileIdList.length).toBeLessThan(settings.file_queue_limit);
            });
        });
    });

    describe('Checking StartUpload functionality', function () {

    });


});