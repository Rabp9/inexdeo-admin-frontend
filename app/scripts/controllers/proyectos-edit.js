'use strict';
proyectos
angular.module('inexdeoAdminApp')
.controller('ProyectosEditCtrl', function ($scope, proyecto, $uibModalInstance, 
    ProyectosService, $q, PagesService) {
        
    $scope.loading = false;
    $scope.proyecto = {};
    var start = 0;
    $scope.tmp_path = angular.module('inexdeoAdminApp').path_location + 'img' + '/paginas/';    
    $scope.tinymceProyectosOptions = {
        toolbar: "undo redo | styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | table | fontsizeselect | fontselect ",
        fontsize_formats: "8pt 10pt 11pt 12pt 13pt 14pt 15pt 16pt 17pt 18pt 19pt 20pt 21pt 22pt 23pt 24pt 25pt 26pt 27pt 28pt",
        plugins: 'lists autolink textcolor colorpicker link media preview table code image',
        language_url : '/scripts/langs_tinymce/es.js',
        file_browser_callback_types: 'image',
        file_browser_callback: function(field_name, url, type, win) {
            $scope.input = field_name;
            $('#flImagen').click();
        }
    };
    
    function getProyectosList() {
        return $q(function(resolve, reject) {
            ProyectosService.getTreeList({spacer: '_'}, function(data) {
                $scope.proyectos_list = data.proyectos;
                resolve($scope.proyectos_list);
            });
        });
    }
    
    getProyectosList().then(function(proyectos_list) {
        ProyectosService.get({id: proyecto.id}, function(data) {
            $scope.proyecto = data.proyecto;
            start = $scope.proyecto.servicio_images.length;
            angular.forEach($scope.proyecto.servicio_images, function(value, key) {
                $scope.images.push({
                    url: angular.module('inexdeoAdminApp').path_location + 'img' + '/' + 'proyectos' + '/' + value.url,
                    id: value.id,
                    deletable : true,
                    title: value.title
                });
                $scope.title_images.push(value.title);
            });
            
            var k = -1;
            angular.forEach(proyectos_list, function(value, key) {
                if (parseInt(value.id) === parseInt($scope.proyecto.parent_id)) {
                    k = key;
                }
            });
            if (k !== -1) {
                $scope.proyecto.parent_id = proyectos_list[k].id;
            }
            
            $scope.brochure_preview = $scope.proyecto.brochure;
        });
    });
    
    $scope.images = [];
    $scope.methods = {};
    $scope.title_images = [];
    var tmp_path = angular.module('inexdeoAdminApp').path_location + 'tmp' + '/';
    
    $scope.cancel = function() {
        $uibModalInstance.dismiss('cancel');
    };

    $scope.saveServicio = function(proyecto, boton, urls_preview, brochure_preview, title_images) {
        $('#' + boton).text('Guardando...');
        $('#' + boton).addClass('disabled');
        $('#' + boton).prop('disabled', true);
        
        angular.forEach(urls_preview, function(value, key) {
            proyecto.servicio_images.push({
                url: value,
                title: title_images[start + key]
            });
        });
        if (brochure_preview !== null) {
            proyecto.brochure = brochure_preview;
        }
        ProyectosService.save(proyecto, function(data) {
            $('#' + boton).removeClass('disabled');
            $('#' + boton).prop('disabled', false);
            $uibModalInstance.close(data);
        }, function(data) {
            $('#' + boton).removeClass('disabled');
            $('#' + boton).prop('disabled', false);
            $uibModalInstance.close({
                message: {
                    type: 'error',
                    text: 'Hubo un error. Código: ' + data.status + ' Mensaje: ' + data.statusText
                }
            });
        });
    };
    
    $scope.delete = function(img, cb) {
        if (confirm('¿Està seguro de eliminar esta imagen?')) {
            var index = $scope.images.indexOf(img);
            ProyectosService.deleteImage({id: img.id}, function(data) {
                $scope.images.splice(index, 1);
                $scope.title_images.splice(index, 1);
                angular.forEach($scope.proyecto.servicio_images, function(value, key) {
                    if (value.id === img.id) {
                        $scope.proyecto.servicio_images.splice(key, 1);
                    }
                });
                // $scope.urls_preview.splice(index, 1);
                if ($scope.images.length > 0) {
                    $scope.methods.open(0);
                } else {
                    $scope.methods.close();
                }
            });
        }
    };
    
    $scope.preview = function(images, errFiles) {
        $scope.loading = true;
        var fd = new FormData();
        
        angular.forEach(images, function(value, key) {
            fd.append('files[]', value);
        });
        
        ProyectosService.preview(fd, function(data) {
            $scope.loading = true;
            $scope.urls_preview = data.filenames;
            var title = 1;
            angular.forEach(data.filenames, function(value, key) {
                var image = {
                    url: tmp_path + value,
                    id: title,
                    deletable : true
                };
                
                $scope.images.push(image);
                title++;
            });
            $scope.loading = false;
            if (data.hasOwnProperty('message')) {
                if (data.message.type === 'error') {
                    alert(data.message.text);
                }
            }
        });
    };
    
    $scope.preview_brochure = function(brochure, errFiles) {
        $scope.loading = true;
        var fd = new FormData();
        fd.append('file', brochure);
        
        ProyectosService.previewBrochure(fd, function(data) {
            if (data.message.type === 'success') {
                $scope.brochure_preview = data.filename;
            } else if (data.message.type === 'error') {
                $scope.brochure_preview = null;
            }
            $scope.loading = false;
        }, function(data) {
            $scope.brochure_preview = null;
            $scope.loading = false;
        });
    };
    
    $scope.upload = function(image, errFiles) {
        var fd = new FormData();
        fd.append('file', image);
        
        PagesService.upload(fd, function(data) {
            $scope.url = $scope.tmp_path + data.filename;
            document.getElementById($scope.input).value = $scope.url;
        });
    };
});