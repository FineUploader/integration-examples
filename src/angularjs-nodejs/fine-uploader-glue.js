(function($) {
    function bindToRenderedTemplate($compile, $scope, element) {
        $compile(element.contents())($scope);

        if (qq.supportedFeatures.folderDrop) {
            $scope.dropZoneText = "Drop Files or Folders Here";
        }
        else if (qq.supportedFeatures.fileDrop) {
            $scope.dropZoneText = "Drop Files Here";
        }
        else {
            $scope.dropZoneText = "Select a File";
        }
    }

    angular.module("fineUploaderDirective", [])
        .directive("fineUploader", function($compile) {
            return {
                restrict: "A",
                replace: true,

                link: function($scope, element, attrs) {
                    $(element).fineUploader({

                    });

                    bindToRenderedTemplate($compile, $scope, element);
                }
            }
        });
})(jQuery);
