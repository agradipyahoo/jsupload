jsupload
=========

JS uploader feature:

1)Allow multiple file uploads using native html5 input element /XHR2 (http://caniuse.com/#feat=xhr2)

2)Allow Mime type Validation

3)Allow file size validation.

Supported Browsers:
http://caniuse.com/#feat=xhr2

http://caniuse.com/#feat=input-file-multiple

How to use:
=========
```
<a href="# id="upload-image">Upload</a>
<script src="jsupload.js"></script>
<script> 
var settings = {
                post_params: {},
                upload_url: currentView.UPLOAD_URL,
                file_size_limit: videoSize,
                file_types: "video/*",
                file_types_description: "Video Files",
                file_queue_limit: 1,
                file_post_name: "file",
                optional_settings:{},
                button_image_url: '/portal/public/images/apps/campaigns/upload_placeeholder.gif',
                // Button settings
                button_placeholder_id: "upload-image" ,
                file_dialog_start_handler:function(){
                   
                },
                file_dialog_complete_handler: function fileDialogComplete(numFilesSelected, numFilesQueued) {
                    
                },
                // The event handler functions are defined in handlers.js
                file_queued_handler: function(file) {
                    // console.log("file_queued_handler", file);
                },
                file_queue_error_handler: function(file,errorCode){
                   
                },
                upload_start_handler: function upload_start_handler(file) {
                   
                },
                upload_progress_handler: function upload_progress_handler(file, bytesLoaded, totalBytes) {
                   
                },
                upload_error_handler: function upload_error_handler(file, errorCode) {
                   
                },
                upload_success_handler: function upload_success_handler(file, serverData) {
                   
                },
                upload_complete_handler: function upload_complete_handler() {
                   
                },
                queue_complete_handler: function() {
                   
                }
}
</script>
```
