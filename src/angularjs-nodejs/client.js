/**
 * AngularJS directive for Fine Uploader UI jQuery (traditional endpoints).
 * Maintained by Widen Enterprises.
 *
 * This example:
 *  - Delegates error messages to Bootstrap's modal component.
 *  - Generates client-side pre-upload image previews (where supported).
 *  - Allows files to be excluded based on extension and MIME type (where supported).
 *  - Determines the most appropriate upload button and drop zone text based on browser capabilities.
 *  - Renders larger image preview on-demand in a Bootstrap modal.
 *  - Keeps an aggregate progress bar up-to-date based on upload status for all files.
 *  - Enables delete file support.
 *  - Ensure newly submitted files are added to the top of the visible list.
 *  - Enables chunking & auto-resume support.
 *
 * Requirements:
 *  - Fine Uploader UI jQuery 4.4.0+ w/ delete file, preview, drag & drop support, and total progress support included
 *  - Bootstrap 3.x
 *  - jQuery 1.5+
 *  - AngularJS 1.0.7+
 */

(function($) {
    function isTouchDevice() {
        return "ontouchstart" in window || navigator.msMaxTouchPoints > 0;
    }

    function initButtonText($scope) {
        var input = document.createElement("input");

        input.setAttribute("multiple", "true");

        if (input.multiple === true && !qq.android()) {
            $scope.uploadButtonText = "Select Files";
        }
        else {
            $scope.uploadButtonText = "Select a File";
        }
    }

    function initDropZoneText($scope, $interpolate) {
        if (qq.supportedFeatures.folderDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files or Folders Here";
        }
        else if (qq.supportedFeatures.fileDrop && !isTouchDevice()) {
            $scope.dropZoneText = "Drop Files Here";
        }
        else {
            $scope.dropZoneText = $scope.$eval($interpolate("Press '{{uploadButtonText}}'"));
        }
    }

    function bindToRenderedTemplate($compile, $scope, $interpolate, element) {
        $compile(element.contents())($scope);

        initButtonText($scope);
        initDropZoneText($scope, $interpolate);
    }

    function applyNewText(propertyName, $scope, newText) {
        $scope.$apply(function() {
            $scope[propertyName] = newText;
        });
    }

    function openLargerPreview($scope, $uploadContainer, size, fileId, name) {
        var $modal = $("#previewDialog"),
            $image = $("#previewContainer"),
            $progress = $modal.find(".progress");

        applyNewText("previewTitle", $scope, "Generating Preview for " + name);
        $image.hide();
        $progress.show();

        $modal
            .one("shown.bs.modal", function() {
                $image.removeAttr("src");
                // setTimeout: Attempt to ensure img.onload is not called after we attempt to draw thumbnail
                // but before picture is transferred to img element as a result of resetting the img.src above.
                setTimeout(function() {
                    $uploadContainer.fineUploader("drawThumbnail", fileId, $image, size).then(function() {
                        applyNewText("previewTitle", $scope, "Preview for " + name);

                        $progress.hide();
                        $image.show();
                    },
                    function(img, error) {
                        $progress.hide();
                        applyNewText("previewTitle", $scope, "Preview not available");
                    });
                }, 0);
            })
            .modal("show");
    }

    angular.module("fineUploaderDirective", [])
        .directive("fineUploader", function($compile, $interpolate) {
            return {
                restrict: "A",
                replace: true,

                link: function($scope, element, attrs) {
                    var endpoint = attrs.uploadServer,
                        notAvailablePlaceholderPath = attrs.notAvailablePlaceholder,
                        waitingPlaceholderPath = attrs.waitingPlaceholder,
                        acceptFiles = attrs.allowedMimes,
                        sizeLimit = attrs.maxFileSize,
                        largePreviewSize = attrs.largePreviewSize,
                        allowedExtensions = $.map(attrs.allowedExtensions.split(","), function(extension) {
                            return $.trim(extension);
                        });

                    $(element).fineUploader({
                        debug: true,
                        request: {
                            endpoint: endpoint,
                            params: {
                                sendThumbnailUrl: !qq.supportedFeatures.imagePreviews
                            }
                        },

                        validation: {
                            acceptFiles: acceptFiles,
                            allowedExtensions: allowedExtensions,
                            sizeLimit: sizeLimit
                        },

                        deleteFile: {
                            endpoint: endpoint,
                            enabled: true
                        },

                        thumbnails: {
                            placeholders: {
                                notAvailablePath: notAvailablePlaceholderPath,
                                waitingPath: waitingPlaceholderPath
                            }
                        },

                        display: {
                            prependFiles: true
                        },

                        failedUploadTextDisplay: {
                            mode: "custom"
                        },

                        retry: {
                            enableAuto: true
                        },

                        chunking: {
                            enabled: true
                        },

                        resume: {
                            enabled: true
                        },

                        showMessage: function(message) {
                            applyNewText("errorMessage", $scope, message);
                            $("#errorDialog").modal("show");
                        },

                        callbacks: {
                            onSubmitted: function(id, name) {
                                var $file = $(this.getItemByFileId(id)),
                                    $thumbnail = $file.find(".qq-thumbnail-selector");

                                $thumbnail.click(function() {
                                    openLargerPreview($scope, $(element), largePreviewSize, id, name);
                                });
                            }
                        }
                    });

                    bindToRenderedTemplate($compile, $scope, $interpolate, element);
                }
            }
        });
})(jQuery);
