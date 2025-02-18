 import * as THREE from 'three'
            import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js'
            import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
            import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
            import Stats from 'three/examples/jsm/libs/stats.module.js'
            import * as CANNON from 'cannon-es'
            import CannonDebugRenderer from '/utils/cannonDebugRenderer.js'

            const scene = new THREE.Scene()

            const light1 = new THREE.SpotLight(0xffffff, 100)
            light1.position.set(2.5, 5, 2.5)
            light1.angle = Math.PI / 8
            light1.penumbra = 0.5
            light1.castShadow = true
            light1.shadow.mapSize.width = 1024
            light1.shadow.mapSize.height = 1024
            light1.shadow.camera.near = 0.5
            light1.shadow.camera.far = 20
            scene.add(light1)

            const light2 = new THREE.SpotLight(0xffffff, 100)
            light2.position.set(-2.5, 5, 2.5)
            light2.angle = Math.PI / 8
            light2.penumbra = 0.5
            light2.castShadow = true
            light2.shadow.mapSize.width = 1024
            light2.shadow.mapSize.height = 1024
            light2.shadow.camera.near = 0.5
            light2.shadow.camera.far = 20
            scene.add(light2)

            const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.01, 100)
            camera.position.set(0, 0, 2)

            const pivot = new THREE.Object3D()
            pivot.position.set(0, 1, 10)

            const yaw = new THREE.Object3D()
            const pitch = new THREE.Object3D()

            scene.add(pivot)
            pivot.add(yaw)
            yaw.add(pitch)
            pitch.add(camera)

            const renderer = new THREE.WebGLRenderer()
            renderer.setSize(window.innerWidth, window.innerHeight)
            renderer.shadowMap.enabled = true
            document.body.appendChild(renderer.domElement)

            const world = new CANNON.World()
            world.gravity.set(0, -9.82, 0)

            const groundMaterial = new CANNON.Material('groundMaterial')
            const slipperyMaterial = new CANNON.Material('slipperyMaterial')
            const slippery_ground_cm = new CANNON.ContactMaterial(groundMaterial, slipperyMaterial, {
                friction: 0,
                restitution: 0.3,
                contactEquationStiffness: 1e8,
                contactEquationRelaxation: 3,
            })
            world.addContactMaterial(slippery_ground_cm)

            // Character Collider
            const characterCollider = new THREE.Object3D()
            characterCollider.position.y = 3
            scene.add(characterCollider)
            const colliderShape = new CANNON.Sphere(0.5)
            const colliderBody = new CANNON.Body({ mass: 1, material: slipperyMaterial })
            colliderBody.addShape(colliderShape, new CANNON.Vec3(0, 0.5, 0))
            colliderBody.addShape(colliderShape, new CANNON.Vec3(0, -0.5, 0))
            colliderBody.position.set(characterCollider.position.x, characterCollider.position.y, characterCollider.position.z)
            colliderBody.linearDamping = 0.95
            colliderBody.angularFactor.set(0, 1, 0) // prevents rotation X,Z axis
            world.addBody(colliderBody)

            let mixer
            let modelReady = false
            let modelMesh
            const animationActions = []
            let activeAction
            let lastAction

            const dracoLoader = new DRACOLoader()
            dracoLoader.setDecoderPath('jsm/libs/draco/') // loading from own webserver

            const gltfLoader = new GLTFLoader()
            gltfLoader.setDRACOLoader(dracoLoader)

            gltfLoader.load(
                '/models/eve$@walk_compressed.glb',
                (gltf) => {
                    gltf.scene.traverse(function (child) {
                        if (child.isMesh) {
                            let m = child
                            m.receiveShadow = true
                            m.castShadow = true
                            m.frustumCulled = false
                            m.geometry.computeVertexNormals()
                            if (child.material) {
                                const mat = child.material
                                mat.transparent = false
                                mat.side = THREE.FrontSide
                            }
                        }
                    })
                    mixer = new THREE.AnimationMixer(gltf.scene)
                    let animationAction = mixer.clipAction(gltf.animations[0])
                    animationActions.push(animationAction)
                    activeAction = animationActions[0]
                    scene.add(gltf.scene)
                    modelMesh = gltf.scene
                    light1.target = modelMesh
                    light2.target = modelMesh

                    //add an animation from another file
                    gltfLoader.load(
                        '/models/eve@walking.glb',
                        (gltf) => {
                            console.log('loaded Eve walking')
                            let animationAction = mixer.clipAction(gltf.animations[0])
                            animationActions.push(animationAction)

                            gltfLoader.load(
                                '/models/eve@jump.glb',
                                (gltf) => {
                                    console.log('loaded Eve jump')
                                    gltf.animations[0].tracks.shift() //delete the specific track that moves the object up/down while jumping
                                    let animationAction = mixer.clipAction(gltf.animations[0])
                                    animationActions.push(animationAction)
                                    //progressBar.style.display = 'none'
                                    modelReady = true

                                    setAction(animationActions[1], true)
                                },
                                (xhr) => {
                                    if (xhr.lengthComputable) {
                                        //const percentComplete = (xhr.loaded / xhr.total) * 100
                                        //progressBar.value = percentComplete
                                        //progressBar.style.display = 'block'
                                    }
                                },
                                (error) => {
                                    console.log(error)
                                }
                            )
                        },
                        (xhr) => {
                            if (xhr.lengthComputable) {
                                //const percentComplete = (xhr.loaded / xhr.total) * 100
                                //progressBar.value = percentComplete
                                //progressBar.style.display = 'block'
                            }
                        },
                        (error) => {
                            console.log(error)
                        }
                    )
                },
                (xhr) => {
                    if (xhr.lengthComputable) {
                        //const percentComplete = (xhr.loaded / xhr.total) * 100
                        //progressBar.value = percentComplete
                        //progressBar.style.display = 'block'
                    }
                },
                (error) => {
                    console.log(error)
                }
            )

            const setAction = (toAction, loop) => {
                if (toAction != activeAction) {
                    lastAction = activeAction
                    activeAction = toAction
                    lastAction.fadeOut(0.1)
                    activeAction.reset()
                    activeAction.fadeIn(0.1)
                    activeAction.play()
                    if (!loop) {
                        activeAction.clampWhenFinished = true
                        activeAction.loop = THREE.LoopOnce
                    }
                }
            }

            let moveForward = false
            let moveBackward = false
            let moveLeft = false
            let moveRight = false
            let canJump = true
            const contactNormal = new CANNON.Vec3()
            const upAxis = new CANNON.Vec3(0, 1, 0)
            colliderBody.addEventListener('collide', function (e) {
                const contact = e.contact
                if (contact.bi.id == colliderBody.id) {
                    contact.ni.negate(contactNormal)
                } else {
                    contactNormal.copy(contact.ni)
                }
                if (contactNormal.dot(upAxis) > 0.5) {
                    if (!canJump) {
                        setAction(animationActions[1], true)
                    }
                    canJump = true
                }
            })

            const planeGeometry = new THREE.PlaneGeometry(100, 100)
            const texture = new THREE.TextureLoader().load('/img/grid.png')
            const plane = new THREE.Mesh(planeGeometry, new THREE.MeshPhongMaterial({ map: texture }))
            plane.rotateX(-Math.PI / 2)
            plane.receiveShadow = true
            scene.add(plane)
            const planeShape = new CANNON.Plane()
            const planeBody = new CANNON.Body({ mass: 0, material: groundMaterial })
            planeBody.addShape(planeShape)
            planeBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2)
            world.addBody(planeBody)

            window.addEventListener('resize', onWindowResize, false)
            function onWindowResize() {
                camera.aspect = window.innerWidth / window.innerHeight
                camera.updateProjectionMatrix()
                renderer.setSize(window.innerWidth, window.innerHeight)
                render()
            }

            function onDocumentMouseMove(e) {
                e.preventDefault()
                yaw.rotation.y -= e.movementX * 0.002
                const v = pitch.rotation.x - e.movementY * 0.002
                if (v > -1 && v < 0.1) {
                    pitch.rotation.x = v
                }
            }

            function onDocumentMouseWheel(e) {
                e.preventDefault()
                const v = camera.position.z + e.deltaY * 0.005
                if (v >= 0.5 && v <= 5) {
                    camera.position.z = v
                }
            }

            const menuPanel = document.getElementById('menuPanel')
            const startButton = document.getElementById('startButton')
            startButton.addEventListener(
                'click',
                () => {
                    renderer.domElement.requestPointerLock()
                },
                false
            )

            let pointerLocked = false
            document.addEventListener('pointerlockchange', () => {
                if (document.pointerLockElement === renderer.domElement) {
                    pointerLocked = true

                    startButton.style.display = 'none'
                    menuPanel.style.display = 'none'

                    document.addEventListener('keydown', onDocumentKey, false)
                    document.addEventListener('keyup', onDocumentKey, false)

                    renderer.domElement.addEventListener('mousemove', onDocumentMouseMove, false)
                    renderer.domElement.addEventListener('wheel', onDocumentMouseWheel, false)
                } else {
                    menuPanel.style.display = 'block'

                    document.removeEventListener('keydown', onDocumentKey, false)
                    document.removeEventListener('keyup', onDocumentKey, false)

                    renderer.domElement.removeEventListener('mousemove', onDocumentMouseMove, false)
                    renderer.domElement.removeEventListener('wheel', onDocumentMouseWheel, false)

                    setTimeout(() => {
                        startButton.style.display = 'block'
                    }, 1000)
                }
            })

            const keyMap = {}
            const onDocumentKey = (e) => {
                keyMap[e.code] = e.type === 'keydown'

                if (pointerLocked) {
                    moveForward = keyMap['KeyW']
                    moveBackward = keyMap['KeyS']
                    moveLeft = keyMap['KeyA']
                    moveRight = keyMap['KeyD']

                    if (keyMap['Space']) {
                        if (canJump === true) {
                            colliderBody.velocity.y = 10
                            setAction(animationActions[2], false)
                        }
                        canJump = false
                    }
                }
            }

            const inputVelocity = new THREE.Vector3()
            const velocity = new CANNON.Vec3()
            const euler = new THREE.Euler()
            const quat = new THREE.Quaternion()
            const v = new THREE.Vector3()
            const targetQuaternion = new THREE.Quaternion()
            let distance = 0

            const stats = new Stats()
            document.body.appendChild(stats.dom)

            const clock = new THREE.Clock()
            let delta = 0

            //const cannonDebugRenderer = new CannonDebugRenderer(scene, world)

            function animate() {
                requestAnimationFrame(animate)

                if (modelReady) {
                    if (canJump) {
                        //walking
                        mixer.update(distance / 10)
                    } else {
                        //were in the air
                        mixer.update(delta)
                    }
                    const p = characterCollider.position
                    p.y -= 1
                    modelMesh.position.y = characterCollider.position.y
                    distance = modelMesh.position.distanceTo(p)

                    const rotationMatrix = new THREE.Matrix4()
                    rotationMatrix.lookAt(p, modelMesh.position, modelMesh.up)
                    targetQuaternion.setFromRotationMatrix(rotationMatrix)

                    if (!modelMesh.quaternion.equals(targetQuaternion)) {
                        modelMesh.quaternion.rotateTowards(targetQuaternion, delta * 10)
                    }

                    if (canJump) {
                        inputVelocity.set(0, 0, 0)

                        if (moveForward) {
                            inputVelocity.z = -1
                        }
                        if (moveBackward) {
                            inputVelocity.z = 1
                        }

                        if (moveLeft) {
                            inputVelocity.x = -1
                        }
                        if (moveRight) {
                            inputVelocity.x = 1
                        }

                        inputVelocity.setLength(delta * 10)

                        // apply camera rotation to inputVelocity
                        euler.y = yaw.rotation.y
                        euler.order = 'XYZ'
                        quat.setFromEuler(euler)
                        inputVelocity.applyQuaternion(quat)
                    }

                    modelMesh.position.lerp(characterCollider.position, 0.1)
                }
                velocity.set(inputVelocity.x, inputVelocity.y, inputVelocity.z)
                colliderBody.applyImpulse(velocity)

                delta = Math.min(clock.getDelta(), 0.1)
                world.step(delta)

                // cannonDebugRenderer.update()

                characterCollider.position.set(colliderBody.position.x, colliderBody.position.y, colliderBody.position.z)
                boxes.forEach((b, i) => {
                    boxMeshes[i].position.set(b.position.x, b.position.y, b.position.z)
                    boxMeshes[i].quaternion.set(b.quaternion.x, b.quaternion.y, b.quaternion.z, b.quaternion.w)
                })

                characterCollider.getWorldPosition(v)
                pivot.position.lerp(v, 0.1)

                render()

                stats.update()
            }

            function render() {
                renderer.render(scene, camera)
            }

            animate()