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
 *  - Fine Uploader UI jQuery w/ delete file, preview, and drag & drop support enabled
 *  - Bootstrap 3.x
 *  - jQuery 1.5+
 *  - AngularJS 1.0.7+
 */

(function($) {
    var perFileProgress = {};

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
                $image.attr("src", "");
                $uploadContainer.fineUploader("drawThumbnail", fileId, $image, size).then(function() {
                    applyNewText("previewTitle", $scope, "Preview for " + name);

                    $progress.hide();
                    $image.show();
                },
                function(img, error) {
                    console.log(error);
                });
            })
            .modal("show");
    }

    function updateTotalProgress() {
        var $container = $("#totalProgress"),
            $bar = $container.find(".progress-bar"),
            totalSent = 0,
            totalSize = 0,
            percentComplete = 0;

        $.each(perFileProgress, function(fileId, progressData) {
            totalSent += progressData[0];
            totalSize += progressData[1];
        });
        percentComplete = Math.round((totalSent/totalSize) * 100);

        if (totalSent !== totalSize) {
            $bar.css({
                width: percentComplete + "%"
            });

            $container.removeClass("hide");
        }
        else {
            $container.addClass("hide");
        }
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
                            onSubmit: function(id) {
                                if (qq.supportedFeatures.progressBar) {
                                    var size = this.getSize(id);

                                    perFileProgress[id] = [0, size];
                                    updateTotalProgress();
                                }
                            },

                            onSubmitted: function(id, name) {
                                var $file = $(this.getItemByFileId(id)),
                                    $thumbnail = $file.find(".qq-thumbnail-selector");

                                $thumbnail.click(function() {
                                    openLargerPreview($scope, $(element), largePreviewSize, id, name);
                                });
                            },

                            onProgress: function(id, name, sent, total) {
                                perFileProgress[id] = [sent, total];
                                updateTotalProgress();
                            },

                            onCancel: function(id) {
                                if (qq.supportedFeatures.progressBar) {
                                    delete perFileProgress[id];
                                    updateTotalProgress();
                                }
                            },

                            onComplete: function(id, name, response) {
                                if (!response.success) {
                                    delete perFileProgress[id];
                                    updateTotalProgress();
                                }
                            }
                        }
                    });

                    bindToRenderedTemplate($compile, $scope, $interpolate, element);
                }
            }
        });
})(jQuery);
