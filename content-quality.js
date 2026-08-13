const CONTENT_QUALITY = {
  Grade: {
    tier: "verified",
    label: "Nuke-tested · 22/22 arguments passed",
    hideDescription: true,
    overview: "Grade remaps an image's tonal range using black point, white point, lift, gain, multiply, offset, and gamma controls. It is commonly used for tonal matching, setting black/white points, and targeted color correction.",
    synopsisArguments: [
      "channels",
      "blackpoint",
      "whitepoint",
      "black",
      "white",
      "multiply",
      "add",
      "gamma",
      "mix",
      "reverse"
    ],
    argumentOverrides: {
      fringe: {
        description: "Softens the edge of the mask so the grade transitions more gradually at the mask boundary."
      }
    }
  },
  ModifyMetaData: {
    tier: "needs-research",
    label: "Special scripting control",
    overview: "ModifyMetaData adds, edits, or removes metadata passing through the node tree. Its metadata control is a list editor containing set/remove actions, keys, and values; it should not be treated like a normal scalar Python knob.",
    note: "The scanner currently cannot fully describe the metadata action-list API. Generic scalar examples are intentionally suppressed until a manually verified scripting example is available.",
    argumentOverrides: {
      metadata: {
        type: "List_Knob / script data",
        defaultValue: "—",
        examplesHtml: '<span class="source-note">Special control</span>',
        description: "Metadata action list. Each row specifies a set/remove action, metadata key, and optional value. Configure this control in the Properties panel or through Nuke script syntax rather than treating it as a float."
      }
    },
    suppressExamples: true
  },
  Blur: {
    tier: "verified",
    label: "Nuke-tested · 12/12 arguments passed",
    hideDescription: true,
    overview: "Blur softens an image by spreading pixel values horizontally and vertically. Use Size to control the blur radius, Filter to choose the falloff, Channels to limit which channels are affected, and Mix to blend the result with the input.",
    synopsisArguments: ["channels", "size", "filter", "mix", "crop"],
    argumentOverrides: {
      size: {
        description: "Horizontal and vertical blur size in pixels. Set one number for both axes or set each axis independently."
      },
      filter: {
        description: "Filter used to shape the blur: box, triangle, quadratic, or gaussian."
      },
      fringe: {
        description: "Softens the edge of the mask so the blur transitions more gradually at the mask boundary."
      },
      quality: {
        description: "Performance-quality threshold for very large blurs. Lower values render faster but may look less smooth."
      }
    }
  },
  Merge2: {
    tier: "verified",
    label: "Nuke-tested · 17/17 arguments passed",
    hideDescription: true,
    overview: "Merge combines foreground input A with background input B. In Python, input 0 is B and input 1 (or higher) is A. The Operation determines how their pixels and alpha interact; Over is the standard choice for placing a premultiplied foreground over a background.",
    synopsisArguments: ["operation", "Achannels", "Bchannels", "output", "mix", "bbox"],
    argumentOverrides: {
      operation: {
        description: "Compositing operation applied between A and B. Use over for a standard premultiplied foreground-over-background composite."
      },
      bbox: {
        description: "Chooses the output bounding box: the union or intersection of both inputs, or only A or B."
      },
      also_merge: {
        description: "Additional non-RGB channels to process with the selected merge operation."
      },
      fringe: {
        description: "Softens the edge of the mask so the merge transitions more gradually at the mask boundary."
      },
      metainput: {
        description: "Chooses whether output metadata comes from B, A, or both inputs. Duplicate keys from B take priority when using All."
      },
      rangeinput: {
        description: "Chooses whether the output frame range comes from B, A, or both inputs."
      }
    }
  },
  Transform: {
    tier: "verified",
    label: "Nuke-tested · 16/16 arguments passed",
    hideDescription: true,
    overview: "Transform repositions a 2D image with translation, rotation, scale, and skew around a chosen center point. It is commonly used to place elements, add simple animation, apply tracked motion, or introduce motion blur.",
    synopsisArguments: ["translate", "rotate", "scale", "center", "filter", "black_outside", "motionblur"],
    argumentOverrides: {
      translate: { description: "Horizontal and vertical movement in pixels." },
      rotate: { description: "Clockwise rotation in degrees around the Center point." },
      scale: { description: "Horizontal and vertical scale multiplier. A value of 1 preserves the original size." },
      center: { description: "Pivot point used for rotation, scaling, and skewing." },
      filter: { description: "Resampling filter used when pixels move or scale. Cubic is a practical general-purpose default." },
      black_outside: { description: "Fills pixels outside the transformed input bounds with black. Disable it when edge pixels need to extend beyond the source bounds." },
      matrix: {
        type: "Matrix4 / Transform2d_Knob",
        examplesHtml: '<span class="source-note">Advanced / derived</span>',
        description: "Derived 4×4 matrix behind the visible transform controls. The identity matrix produces no visual change, and direct component editing is rarely useful in normal compositing scripts. Prefer Translate, Rotate, Scale, Skew, and Center; use value() only when another tool needs the composed Matrix4."
      },
      motionblur: { description: "Controls the number of motion-blur samples. Zero disables motion blur; higher values improve smoothness at additional render cost." },
      shutter: { description: "Duration of the motion-blur exposure measured in frames." }
    }
  },
  Unpremult: {
    tier: "verified",
    label: "Nuke-tested · 3/3 arguments passed",
    hideDescription: true,
    overview: "Unpremult divides selected color channels by an alpha channel, recovering the unassociated RGB values beneath soft or partially transparent edges. Use it before color corrections on premultiplied elements, then add a Premult afterward to restore the RGB-alpha relationship.",
    synopsisArguments: ["channels", "alpha", "invert"],
    example: { title: "Restore premultiplication after a color correction", code: '# Build an Unpremult -> Grade -> Premult workflow.\nelement = nuke.createNode("ColorWheel")\nunpremult = nuke.createNode("Unpremult")\nunpremult.setInput(0, element)\ngrade = nuke.createNode("Grade")\ngrade.setInput(0, unpremult)\ngrade["multiply"].setValue(1.15)\n\n# Multiply corrected RGB by alpha again before an Over composite.\npremult = nuke.createNode("Premult")\npremult.setInput(0, grade)\npremult["channels"].setValue("rgb")\npremult["alpha"].setValue("alpha")' },
    argumentOverrides: {
      channels: { description: "Channels to divide by the selected alpha source. RGB is the standard choice for normal premultiplied imagery." },
      alpha: { description: "Channel used as the divisor. Alpha is the standard source for an RGBA element." },
      invert: { description: "Divides by one minus the selected alpha channel instead of the alpha itself." }
    }
  },
  Premult: {
    tier: "verified", label: "Nuke-tested · 3/3 arguments passed", hideDescription: true,
    overview: "Premult multiplies selected color channels by an alpha channel, restoring the RGB-alpha relationship required for a standard Over composite. Use it after operations performed on unpremultiplied RGB; avoid applying it again to imagery that is already premultiplied.",
    synopsisArguments: ["channels", "alpha", "invert"],
    argumentOverrides: {
      channels: { description: "Channels to multiply by the selected alpha source. RGB is the standard choice." },
      alpha: { description: "Channel used as the multiplier. Alpha is the standard source for RGBA imagery." },
      invert: { description: "Multiplies by one minus the selected alpha channel instead of alpha." }
    }
  },
  Saturation: {
    tier: "verified", label: "Nuke-tested · 12/12 arguments passed", hideDescription: true,
    overview: "Saturation changes color intensity without directly changing image luminance. A value of 0 produces grayscale, 1 preserves the input, and values above 1 increase color intensity.",
    synopsisArguments: ["channels", "saturation", "mode", "mix", "unpremult"],
    example: { title: "Create a controlled muted-color treatment", code: '# Create a source so the example runs in an empty script.\nsource = nuke.createNode("ColorWheel")\nsat = nuke.createNode("Saturation")\nsat.setInput(0, source)\nsat["channels"].setValue("rgb")\nsat["mode"].setValue("Rec 709")\n\n# Reduce color intensity while retaining some original color.\nsat["saturation"].setValue(0.35)\nsat["mix"].setValue(0.85)' },
    argumentOverrides: {
      saturation: { description: "Color-intensity multiplier: 0 is grayscale, 1 is unchanged, and values above 1 increase saturation." },
      mode: { description: "Luminance calculation used while adjusting saturation. Rec 709 is the normal modern default." },
      fringe: { description: "Softens the mask boundary so the saturation adjustment transitions more gradually." }
    }
  },
  Crop: {
    tier: "verified", label: "Nuke-tested · 7/7 arguments passed", hideDescription: true,
    overview: "Crop limits an image and its bounding box to a rectangular region. It can preserve the original coordinate system or move the cropped region to the origin and create a matching output format.",
    synopsisArguments: ["box", "crop", "reformat", "intersect", "softness"],
    example: { title: "Crop ten percent from every edge", code: '# Create a source and crop relative to its format.\nsource = nuke.createNode("CheckerBoard2")\nwidth = source.width()\nheight = source.height()\nmargin_x = width * 0.10\nmargin_y = height * 0.10\n\ncrop = nuke.createNode("Crop")\ncrop.setInput(0, source)\ncrop["box"].setValue([margin_x, margin_y, width - margin_x, height - margin_y])\n\n# Move the result to 0,0 and match the format to the crop.\ncrop["crop"].setValue(True)\ncrop["reformat"].setValue(True)' },
    argumentOverrides: {
      box: { description: "Crop rectangle in left, bottom, right, top pixel coordinates." },
      crop: { description: "Adds a black boundary so pixels outside the crop rectangle evaluate as black." },
      reformat: { description: "Moves the cropped region to 0,0 and changes the output format to the crop size." },
      reset: { type: "Script_Knob / button", examplesHtml: '<span class="source-note">UI action</span>', description: "Properties-panel button that resets the crop box; not a normal value argument." }
    }
  },
  Reformat: {
    tier: "verified", label: "Nuke-tested · 16/16 arguments passed", hideDescription: true,
    overview: "Reformat converts an image to a new resolution or pixel aspect ratio. Use Fit to preserve the entire image, Fill to cover the output while cropping excess, or Distort when independent width and height scaling is intentional.",
    synopsisArguments: ["type", "resize", "format", "box_width", "box_height", "filter", "center"],
    example: { title: "Fit an image into a 1280 × 720 delivery frame", code: '# Create a source and fit it inside a fixed HD delivery box.\nsource = nuke.createNode("CheckerBoard2")\nreformat = nuke.createNode("Reformat")\nreformat.setInput(0, source)\nreformat["type"].setValue("to box")\nreformat["box_width"].setValue(1280)\nreformat["box_height"].setValue(720)\nreformat["box_pixel_aspect"].setValue(1.0)\nreformat["box_fixed"].setValue(True)\nreformat["resize"].setValue("fit")\nreformat["center"].setValue(True)\nreformat["filter"].setValue("cubic")' },
    argumentOverrides: {
      format: { type: "Format / Format_Knob", examplesHtml: '<span class="source-note">nuke.Format</span>', description: "Output format object or registered project-format name when Type is set to to format." },
      resize: { description: "Scaling policy: none, width, height, fit, fill, or distort." },
      pbb: { description: "Preserves pixels outside the output format bounding box instead of clipping them." }
    }
  },
  Shuffle2: {
    tier: "needs-research", label: "Nuke-tested control · mapping serialization needs research", hideDescription: true,
    overview: "Shuffle rearranges channels between layers and supports mappings from two inputs. Its mapping UI is stored in a compound NoodleKnob rather than ordinary scalar arguments, so generic knob-setting examples are intentionally withheld until its script representation is verified.",
    synopsisArguments: [],
    argumentOverrides: {
      shuffle: { type: "NoodleKnob / channel mapping data", examplesHtml: '<span class="source-note">Special control</span>', description: "Verified as a visible NoodleKnob. Its default toScript() result is empty, so the editable channel-mapping serialization still needs a change-and-inspect test. Do not treat it as a float despite the scanner's current classification." }
    },
    suppressExamples: true
  },
  Dissolve: {
    tier: "verified", label: "Nuke-tested · 10/10 arguments passed", hideDescription: true,
    overview: "Dissolve switches or blends between multiple image inputs. Whole-number Which values select an input; fractional values blend between neighboring inputs, making it useful for transitions and version comparisons.",
    synopsisArguments: ["which", "channels", "mergerange", "metainput"],
    example: { title: "Animate a twelve-frame transition between two images", code: '# Create two sources and dissolve between them.\nfirst = nuke.createNode("CheckerBoard2")\nsecond = nuke.createNode("ColorWheel")\ndissolve = nuke.createNode("Dissolve")\ndissolve.setInput(0, first)\ndissolve.setInput(1, second)\nstart = int(nuke.root()["first_frame"].value())\ndissolve["which"].setAnimated()\ndissolve["which"].setValueAt(0.0, start)\ndissolve["which"].setValueAt(1.0, start + 12)' },
    argumentOverrides: { which: { description: "Selects an input at whole numbers and blends between adjacent inputs at fractional values." }, metainput: { description: "Chooses which input supplies output metadata." } }
  },
  Switch: {
    tier: "verified", label: "Nuke-tested · 1/1 argument passed", hideDescription: true,
    overview: "Switch outputs one of its connected inputs. Animate Which to change sources over time, or drive it with an expression to select versions, quality levels, or fallback branches.",
    synopsisArguments: ["which"],
    example: { title: "Switch from a temporary plate to a final plate", code: '# Build two stand-in sources and switch at frame 101.\ntemporary = nuke.createNode("CheckerBoard2")\nfinal = nuke.createNode("ColorWheel")\nswitch = nuke.createNode("Switch")\nswitch.setInput(0, temporary)\nswitch.setInput(1, final)\nswitch["which"].setExpression("frame < 101 ? 0 : 1")' },
    argumentOverrides: { which: { description: "Zero-based index of the input to output. It may be animated or expression-driven." } }
  },
  Keymix: {
    tier: "verified", label: "Nuke-tested · 5/5 arguments passed", hideDescription: true,
    overview: "Keymix copies selected channels from A into B through a mask. It is useful for localized replacements where the mask should control exactly where foreground channels replace the background.",
    synopsisArguments: ["channels", "maskChannel", "invertMask", "mix", "bbox"],
    example: { title: "Replace part of a background through a matte", code: '# Generate A, B, and mask inputs for a self-contained Keymix.\nbackground = nuke.createNode("CheckerBoard2")\nreplacement = nuke.createNode("ColorWheel")\nmatte = nuke.createNode("Radial")\nkeymix = nuke.createNode("Keymix")\nkeymix.setInput(0, replacement)  # A\nkeymix.setInput(1, background)   # B\nkeymix.setInput(2, matte)        # mask\nkeymix["channels"].setValue("rgba")\nkeymix["maskChannel"].setValue("alpha")\nkeymix["mix"].setValue(1.0)' },
    argumentOverrides: { bbox: { description: "Chooses the output bounding box from the union, B side, or A side." } }
  },
  Remove: {
    tier: "verified", label: "Nuke-tested · 5/5 arguments passed", hideDescription: true,
    overview: "Remove deletes selected channels or keeps only selected channels. It is commonly used to strip unused render passes and keep scripts lighter and easier to inspect.",
    synopsisArguments: ["operation", "channels", "channels2", "channels3", "channels4"],
    example: { title: "Keep only RGBA before continuing the composite", code: '# Create a source and discard every channel except RGBA.\nsource = nuke.createNode("ColorWheel")\nremove = nuke.createNode("Remove")\nremove.setInput(0, source)\nremove["operation"].setValue("keep")\nremove["channels"].setValue("rgba")' }
  },
  Copy: {
    tier: "verified", label: "Nuke-tested · 21/21 arguments passed", hideDescription: true,
    overview: "Copy transfers channels from input A into input B while leaving the other B channels unchanged. A common use is copying a newly created matte into the alpha channel of an RGB element.",
    synopsisArguments: ["from0", "to0", "channels", "mix", "bbox"],
    example: { title: "Copy a generated matte into an element's alpha", code: '# Generate an RGB element and a separate matte.\nelement = nuke.createNode("ColorWheel")\nmatte = nuke.createNode("Radial")\ncopy = nuke.createNode("Copy")\ncopy.setInput(0, matte)    # A: channel source\ncopy.setInput(1, element)  # B: image to preserve\ncopy["from0"].setValue("alpha")\ncopy["to0"].setValue("alpha")\ncopy["mix"].setValue(1.0)' },
    argumentOverrides: { from0: { description: "Source channel read from input A." }, to0: { description: "Destination channel written into the output based on input B." } }
  },
  Gamma: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Gamma reshapes midtones while leaving zero and one anchored. Values above 1 brighten midtones and values below 1 darken them.",
    synopsisArguments: ["value", "channels", "mix", "unpremult"],
    example: { title: "Lift dark midtones without moving black or white", code: '# Create a source and apply a subtle RGB gamma adjustment.\nsource = nuke.createNode("ColorWheel")\ngamma = nuke.createNode("Gamma")\ngamma.setInput(0, source)\ngamma["channels"].setValue("rgb")\ngamma["value"].setValue(1.15)\ngamma["mix"].setValue(0.8)' },
    argumentOverrides: { value: { description: "Per-channel gamma control. Values above 1 brighten midtones; values below 1 darken them." } }
  },
  Invert: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Invert subtracts selected channels from one. It is commonly used to reverse mattes or create a photographic negative of RGB channels.",
    synopsisArguments: ["channels", "clamp", "mix"],
    example: { title: "Invert an alpha matte while preserving RGB", code: '# Create an alpha-bearing source and invert only its matte.\nsource = nuke.createNode("Radial")\ninvert = nuke.createNode("Invert")\ninvert.setInput(0, source)\ninvert["channels"].setValue("alpha")\ninvert["clamp"].setValue(True)\ninvert["mix"].setValue(1.0)' }
  },
  Clamp: {
    tier: "verified", label: "Nuke-tested · 18/18 arguments passed", hideDescription: true,
    overview: "Clamp limits channel values to a chosen range. It is useful for constraining mattes to 0–1 or preventing negative and super-white values before operations that require bounded data.",
    synopsisArguments: ["channels", "minimum", "maximum", "minimum_enable", "maximum_enable", "mix"],
    example: { title: "Constrain a matte to the legal 0–1 range", code: '# Create a matte source and clamp only alpha.\nsource = nuke.createNode("Radial")\nclamp = nuke.createNode("Clamp")\nclamp.setInput(0, source)\nclamp["channels"].setValue("alpha")\nclamp["minimum_enable"].setValue(True)\nclamp["minimum"].setValue(0.0)\nclamp["maximum_enable"].setValue(True)\nclamp["maximum"].setValue(1.0)' }
  },
  Colorspace: {
    tier: "verified", label: "Nuke-tested · 17 writable arguments passed · 2 special controls inspected", hideDescription: true,
    overview: "Colorspace converts image values between legacy color spaces, primaries, and illuminants. In modern OCIO-managed projects, prefer OCIOColorSpace unless this legacy node is specifically required.",
    synopsisArguments: ["colorspace_in", "colorspace_out", "channels", "mix"],
    example: { title: "Convert legacy sRGB-encoded values to linear", code: '# Convert an sRGB-encoded source into linear values.\nsource = nuke.createNode("ColorWheel")\nconvert = nuke.createNode("Colorspace")\nconvert.setInput(0, source)\nconvert["channels"].setValue("rgb")\nconvert["colorspace_in"].setValue("sRGB")\nconvert["colorspace_out"].setValue("RGB")' },
    argumentOverrides: {
      colormatrix: { type: "IArray_Knob / derived matrix", examplesHtml: '<span class="source-note">Advanced / derived</span>', description: "Read-only-style matrix output from some transforms; not a normal integer or list argument to replay from scanner data." },
      swap: { type: "Script_Knob / button", examplesHtml: '<span class="source-note">UI action</span>', description: "Swaps input and output settings in the Properties panel." }
    }
  },
  Log2Lin: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Log2Lin converts between legacy Cineon log values and linear light using configurable black, white, and film-gamma points. Use it for Cineon-style material when an OCIO transform is not the appropriate pipeline conversion.",
    synopsisArguments: ["operation", "channels", "black", "white", "gamma", "mix"],
    example: { title: "Convert Cineon log values to linear light", code: '# Create a source and apply the standard Cineon-style conversion.\nsource = nuke.createNode("ColorWheel")\nconvert = nuke.createNode("Log2Lin")\nconvert.setInput(0, source)\nconvert["operation"].setValue("log2lin")\nconvert["channels"].setValue("rgb")\nconvert["black"].setValue(95.0)\nconvert["white"].setValue(685.0)\nconvert["gamma"].setValue(0.6)' }
  },
  Constant: {
    tier: "verified", label: "Nuke-tested · 4 writable arguments passed · format control inspected", hideDescription: true,
    overview: "Constant creates a flat-color image at the project format. It is useful for backgrounds, utility mattes, test elements, and solid inputs for procedural setups.",
    synopsisArguments: ["color", "channels", "format", "first", "last"],
    example: { title: "Create a neutral-gray background for a comp", code: '# Create a project-sized neutral-gray background.\nbackground = nuke.createNode("Constant")\nbackground["channels"].setValue("rgba")\nbackground["color"].setValue([0.18, 0.18, 0.18, 1.0])\nbackground["first"].setValue(nuke.root().firstFrame())\nbackground["last"].setValue(nuke.root().lastFrame())' },
    argumentOverrides: { format: { examplesHtml: '<span class="source-note">Format object</span>', description: "Output format. Pass a valid nuke.Format object or select a named project format; scanner object strings are not reusable values." } }
  },
  ColorCorrect: {
    tier: "verified", label: "Nuke-tested · 33 writable arguments passed · 5 special controls inspected", hideDescription: true,
    overview: "ColorCorrect adjusts saturation, contrast, gamma, gain, and offset across the whole image or separately in shadows, midtones, and highlights.",
    synopsisArguments: ["channels", "saturation", "contrast", "gamma", "gain", "offset", "mix"],
    example: { title: "Warm highlights while adding gentle overall contrast", code: '# Build a restrained look on a generated source.\nsource = nuke.createNode("ColorWheel")\ncorrect = nuke.createNode("ColorCorrect")\ncorrect.setInput(0, source)\ncorrect["channels"].setValue("rgb")\ncorrect["contrast"].setValue(1.08)\ncorrect["gamma"].setValue(1.03)\ncorrect["highlights.gain"].setValue([1.08, 1.03, 0.96, 1.0])\ncorrect["shadows.saturation"].setValue(0.9)\ncorrect["mix"].setValue(0.85)' },
    argumentOverrides: {
      lookup: { examplesHtml: '<span class="source-note">Advanced curve control</span>', description: "Defines the shadow and highlight ranges. Its curve serialization requires dedicated handling rather than scalar setValue examples." },
      master: { examplesHtml: '<span class="source-note">UI group</span>' }, shadows: { examplesHtml: '<span class="source-note">UI group</span>' }, midtones: { examplesHtml: '<span class="source-note">UI group</span>' }, highlights: { examplesHtml: '<span class="source-note">UI group</span>' }
    }
  },
  Dilate: {
    tier: "verified", label: "Nuke-tested · 9/9 arguments passed", hideDescription: true,
    overview: "Dilate grows or shrinks selected channels. It is commonly used to expand or contract alpha mattes before edge treatment or compositing.",
    synopsisArguments: ["size", "channels", "mix"],
    example: { title: "Grow an alpha matte before edge treatment", code: '# Generate a matte and expand its edge slightly.\nmatte = nuke.createNode("Radial")\ndilate = nuke.createNode("Dilate")\ndilate.setInput(0, matte)\ndilate["channels"].setValue("alpha")\ndilate["size"].setValue(2.0)\ndilate["mix"].setValue(1.0)' }
  },
  Defocus: {
    tier: "verified", label: "Nuke-tested · 13/13 arguments passed", hideDescription: true,
    overview: "Defocus uses a disc-shaped filter to simulate lens defocus and circular highlight bloom. For an ordinary soft blur, Blur is usually faster.",
    synopsisArguments: ["defocus", "ratio", "scale", "quality", "method", "channels", "mix"],
    example: { title: "Create a subtle lens-defocus background", code: '# Create a test image and soften it with a circular lens filter.\nsource = nuke.createNode("ColorBars")\ndefocus = nuke.createNode("Defocus")\ndefocus.setInput(0, source)\ndefocus["channels"].setValue("rgb")\ndefocus["defocus"].setValue(8.0)\ndefocus["ratio"].setValue(1.0)\ndefocus["method"].setValue("accelerated")\ndefocus["quality"].setValue(20.0)' }
  },
  EdgeBlur: {
    tier: "verified", label: "Nuke-tested · 17/17 arguments passed", hideDescription: true,
    overview: "EdgeBlur detects edges in a chosen control channel and blurs only those regions. It is useful for softening overly sharp matte boundaries without blurring the entire element.",
    synopsisArguments: ["controlchannel", "size", "edge_mult", "filter", "quality", "channels", "mix"],
    example: { title: "Soften the boundary of an alpha matte", code: '# Generate an alpha-bearing element and soften only its edge.\nsource = nuke.createNode("Radial")\nedge_blur = nuke.createNode("EdgeBlur")\nedge_blur.setInput(0, source)\nedge_blur["controlchannel"].setValue("alpha")\nedge_blur["channels"].setValue("rgba")\nedge_blur["size"].setValue(3.0)\nedge_blur["edge_mult"].setValue(2.0)\nedge_blur["filter"].setValue("gaussian")\nedge_blur["mix"].setValue(1.0)' }
  },
  Multiply: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Multiply scales selected channel values by a factor. It behaves like gain: values above one brighten while preserving zero, and values below one darken.",
    synopsisArguments: ["value", "channels", "mix", "unpremult"],
    example: { title: "Reduce an element's RGB intensity before merging", code: '# Create an element and reduce its intensity without lifting black.\nsource = nuke.createNode("ColorWheel")\nmultiply = nuke.createNode("Multiply")\nmultiply.setInput(0, source)\nmultiply["channels"].setValue("rgb")\nmultiply["value"].setValue(0.8)\nmultiply["mix"].setValue(1.0)' }
  },
  Add: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Add applies a fixed offset to selected channels. Unlike Multiply, it moves black as well as brighter values, making it useful for small level offsets or channel-specific biases.",
    synopsisArguments: ["value", "channels", "mix", "unpremult"],
    example: { title: "Add a small RGB floor to a generated element", code: '# Raise all RGB values by a small fixed amount.\nsource = nuke.createNode("ColorWheel")\nadd = nuke.createNode("Add")\nadd.setInput(0, source)\nadd["channels"].setValue("rgb")\nadd["value"].setValue(0.02)\nadd["mix"].setValue(1.0)' }
  },
  HueShift: {
    tier: "verified", label: "Nuke-tested · 17/17 arguments passed", hideDescription: true,
    overview: "HueShift rotates color around a luminance-oriented color space while also providing saturation, axis, gray-point, and brightness controls.",
    synopsisArguments: ["hue_rotation", "saturation", "brightness", "color", "color_saturation", "channels", "mix"],
    example: { title: "Create a controlled palette variation", code: '# Rotate the palette while keeping the correction restrained.\nsource = nuke.createNode("ColorWheel")\nhue_shift = nuke.createNode("HueShift")\nhue_shift.setInput(0, source)\nhue_shift["channels"].setValue("rgb")\nhue_shift["hue_rotation"].setValue(20.0)\nhue_shift["saturation"].setValue(0.9)\nhue_shift["brightness"].setValue(1.0)\nhue_shift["mix"].setValue(0.75)' }
  },
  Sharpen: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Sharpen increases local edge contrast in selected channels. Small amounts are useful for restoring perceived detail after filtering or resizing; aggressive settings can create halos.",
    synopsisArguments: ["amount", "size", "filter", "quality", "channels", "mix"],
    example: { title: "Restore subtle detail after a resize", code: '# Create a test image and apply restrained RGB sharpening.\nsource = nuke.createNode("ColorBars")\nsharpen = nuke.createNode("Sharpen")\nsharpen.setInput(0, source)\nsharpen["channels"].setValue("rgb")\nsharpen["amount"].setValue(0.3)\nsharpen["size"].setValue(2.0)\nsharpen["filter"].setValue("gaussian")\nsharpen["mix"].setValue(0.8)' }
  },
  Erode: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "Erode contracts or expands selected channels using a filtered matte operation. It is commonly used for small alpha-edge adjustments, with blur available to soften the result.",
    synopsisArguments: ["size", "blur", "quality", "channels", "mix"],
    example: { title: "Contract and soften an alpha matte", code: '# Generate a matte, pull its edge inward, and soften the transition.\nmatte = nuke.createNode("Radial")\nerode = nuke.createNode("Erode")\nerode.setInput(0, matte)\nerode["channels"].setValue("alpha")\nerode["size"].setValue(-2.0)\nerode["blur"].setValue(0.5)\nerode["quality"].setValue(15.0)' }
  },
  AddChannels: {
    tier: "verified", label: "Nuke-tested · 6/6 arguments passed", hideDescription: true,
    overview: "AddChannels creates missing channels or layers on an image and initializes them with a chosen value. Existing channel data is left unchanged.",
    synopsisArguments: ["channels", "channels2", "color", "format_size"],
    example: { title: "Add a four-channel utility layer", code: '# Define a custom layer, then add it to a generated image.\nnuke.Layer("utility", ["utility.red", "utility.green", "utility.blue", "utility.alpha"])\nsource = nuke.createNode("ColorWheel")\nadd_channels = nuke.createNode("AddChannels")\nadd_channels.setInput(0, source)\nadd_channels["channels"].setValue("utility")\nadd_channels["color"].setValue([0.0, 0.0, 0.0, 1.0])' }
  },
  AdjBBox: {
    tier: "verified", label: "Nuke-tested · 1/1 argument passed", hideDescription: true,
    overview: "AdjBBox expands or crops an image's bounding box by a chosen number of pixels without changing the project format.",
    synopsisArguments: ["numpixels"],
    example: { title: "Add working room around a procedural element", code: '# Generate a bounded element and expand its bounding box.\nsource = nuke.createNode("Radial")\nadjust_bbox = nuke.createNode("AdjBBox")\nadjust_bbox.setInput(0, source)\nadjust_bbox["numpixels"].setValue([20.0, 20.0])' }
  },
  ContactSheet: {
    tier: "verified", label: "Nuke-tested · 11/11 arguments passed", hideDescription: true,
    overview: "ContactSheet arranges multiple inputs—or a range of frames from each input—into a configurable review grid.",
    synopsisArguments: ["width", "height", "rows", "columns", "gap", "roworder", "colorder"],
    example: { title: "Build a four-up comparison sheet", code: '# Generate four sources and arrange them in a 2x2 review grid.\nsources = [\n    nuke.createNode("ColorBars"),\n    nuke.createNode("ColorWheel"),\n    nuke.createNode("CheckerBoard2"),\n    nuke.createNode("Constant"),\n]\nsheet = nuke.createNode("ContactSheet")\nfor index, source in enumerate(sources):\n    sheet.setInput(index, source)\nsheet["width"].setValue(1920)\nsheet["height"].setValue(1080)\nsheet["rows"].setValue(2)\nsheet["columns"].setValue(2)\nsheet["gap"].setValue(12)' }
  },
  FrameHold: {
    tier: "verified", label: "Nuke-tested · 5 writable arguments passed · 3 special controls inspected", hideDescription: true,
    overview: "FrameHold freezes an input at one frame, or samples it at a regular frame interval when increment is greater than zero.",
    synopsisArguments: ["firstFrame", "increment", "rounding_mode"],
    example: { title: "Freeze a source at frame 100", code: '# Create a source and hold its frame 100 for the full timeline.\nsource = nuke.createNode("ColorBars")\nhold = nuke.createNode("FrameHold")\nhold.setInput(0, source)\nhold["firstFrame"].setValue(100)\nhold["increment"].setValue(0)\nhold["rounding_mode"].setValue("Whole frames")' },
    argumentOverrides: { mask_patterns: { examplesHtml: '<span class="source-note">Scene path control</span>' }, path_mask_group: { examplesHtml: '<span class="source-note">UI group</span>' }, setToCurrentFrame: { examplesHtml: '<span class="source-note">UI action</span>' } }
  },
  TimeOffset: {
    tier: "verified", label: "Nuke-tested · 5 writable arguments passed · 3 special controls inspected", hideDescription: true,
    overview: "TimeOffset slips an input earlier or later without changing its playback speed. Positive offsets request later source frames; negative offsets request earlier ones.",
    synopsisArguments: ["time_offset", "rounding_mode", "reverse_input"],
    example: { title: "Slip an element eight frames earlier", code: '# Create a source and offset its requested frame by eight frames.\nsource = nuke.createNode("ColorBars")\noffset = nuke.createNode("TimeOffset")\noffset.setInput(0, source)\noffset["time_offset"].setValue(-8)\noffset["rounding_mode"].setValue("Whole frames")' },
    argumentOverrides: { mask_patterns: { examplesHtml: '<span class="source-note">Scene path control</span>' }, path_mask_group: { examplesHtml: '<span class="source-note">UI group</span>' }, time: { examplesHtml: '<span class="source-note">Derived frame range</span>', description: "Derived frame-extent control; use time_offset for ordinary frame slipping." } }
  },
  FrameRange: {
    tier: "verified", label: "Nuke-tested · 2 writable arguments passed · 2 special controls inspected", hideDescription: true,
    overview: "FrameRange restricts the frame range reported by an input. It is useful for trimming source ranges before editorial operations such as AppendClip.",
    synopsisArguments: ["first_frame", "last_frame"],
    example: { title: "Trim a source to a working frame range", code: '# Create a source and expose only frames 100 through 150.\nsource = nuke.createNode("ColorBars")\nframe_range = nuke.createNode("FrameRange")\nframe_range.setInput(0, source)\nframe_range["first_frame"].setValue(100)\nframe_range["last_frame"].setValue(150)' },
    argumentOverrides: { reset: { examplesHtml: '<span class="source-note">UI action</span>' }, time: { examplesHtml: '<span class="source-note">Derived frame range</span>' } }
  },
  TimeClip: {
    tier: "verified", label: "Nuke-tested · 14 writable arguments passed · derived time control inspected", hideDescription: true,
    overview: "TimeClip combines trimming, slipping, reversing, fades, and out-of-range behavior in one editorial node.",
    synopsisArguments: ["first", "last", "frame_mode", "frame", "before", "after", "reverse", "fadeIn", "fadeOut"],
    example: { title: "Trim and slip a clip with held boundary frames", code: '# Create a source, trim it, and slip the requested source time.\nsource = nuke.createNode("ColorBars")\nclip = nuke.createNode("TimeClip")\nclip.setInput(0, source)\nclip["first"].setValue(100)\nclip["last"].setValue(150)\nclip["before"].setValue("hold")\nclip["after"].setValue("hold")\nclip["frame_mode"].setValue("expression")\nclip["frame"].setValue("frame + 8")\nclip["fadeIn"].setValue(0)\nclip["fadeOut"].setValue(0)' },
    argumentOverrides: { time: { examplesHtml: '<span class="source-note">Derived time control</span>' } }
  },
  AppendClip: {
    tier: "verified", label: "Nuke-tested · 6 writable arguments passed · derived time control inspected", hideDescription: true,
    overview: "AppendClip joins multiple inputs head-to-tail and can add fades or cross-dissolves at the edit points.",
    synopsisArguments: ["firstFrame", "fadeIn", "fadeOut", "dissolve", "meta_from_first"],
    example: { title: "Join two trimmed clips with a short dissolve", code: '# Generate two sources, trim them, and append them head-to-tail.\nfirst_source = nuke.createNode("ColorBars")\nsecond_source = nuke.createNode("ColorWheel")\nfirst_trim = nuke.createNode("FrameRange")\nfirst_trim.setInput(0, first_source)\nfirst_trim["first_frame"].setValue(1)\nfirst_trim["last_frame"].setValue(24)\nsecond_trim = nuke.createNode("FrameRange")\nsecond_trim.setInput(0, second_source)\nsecond_trim["first_frame"].setValue(1)\nsecond_trim["last_frame"].setValue(24)\nappend = nuke.createNode("AppendClip")\nappend.setInput(0, first_trim)\nappend.setInput(1, second_trim)\nappend["dissolve"].setValue(4)\nappend["firstFrame"].setValue(1)' },
    argumentOverrides: { time: { examplesHtml: '<span class="source-note">Derived frame range</span>' } }
  },
  BlackOutside: {
    tier: "verified", label: "Nuke-tested creation · no node-specific arguments", hideDescription: true,
    overview: "BlackOutside fills pixels beyond the incoming bounding box with black, preventing replicated edge pixels after bounding-box operations.",
    synopsisArguments: [],
    example: { title: "Black out pixels beyond an expanded bounding box", code: '# Expand a procedural element bounding box, then black its exterior.\nsource = nuke.createNode("Radial")\nadjust_bbox = nuke.createNode("AdjBBox")\nadjust_bbox.setInput(0, source)\nadjust_bbox["numpixels"].setValue(20)\nblack_outside = nuke.createNode("BlackOutside")\nblack_outside.setInput(0, adjust_bbox)' }
  },
  CopyBBox: {
    tier: "verified", label: "Nuke-tested creation · no node-specific arguments", hideDescription: true,
    overview: "CopyBBox applies the bounding box from input A to the image from input B, often trimming an unnecessarily expanded processing area.",
    synopsisArguments: [],
    example: { title: "Constrain a composite to a reference bounding box", code: '# Use generated matte bounds to constrain another image.\nbounds = nuke.createNode("Radial")\nimage = nuke.createNode("ColorWheel")\ncopy_bbox = nuke.createNode("CopyBBox")\ncopy_bbox.setInput(0, bounds)  # A supplies the bounding box\ncopy_bbox.setInput(1, image)   # B supplies the image' }
  },
  ColorBars: {
    tier: "verified", label: "Nuke-tested · 2 writable arguments passed · format control inspected", hideDescription: true,
    overview: "ColorBars generates an SMPTE test pattern for checking image pipelines, channel processing, and color-management behavior.",
    synopsisArguments: ["barintensity", "PAL", "format"],
    example: { title: "Create a full-intensity test pattern", code: '# Generate color bars using the project format.\nbars = nuke.createNode("ColorBars")\nbars["barintensity"].setValue(1.0)\nbars["PAL"].setValue(False)' },
    argumentOverrides: { format: { examplesHtml: '<span class="source-note">Format object</span>' } }
  },
  ColorWheel: {
    tier: "verified", label: "Nuke-tested · 9 writable arguments passed · format control inspected", hideDescription: true,
    overview: "ColorWheel generates a hue wheel with configurable center and edge saturation, value, rotation, and gamma. It is useful for testing color operations visually.",
    synopsisArguments: ["channels", "centerSaturation", "edgeSaturation", "centerValue", "edgeValue", "gamma", "rotate", "fillFormat"],
    example: { title: "Create a rotated color-correction test image", code: '# Generate a full-format wheel with a neutral center.\nwheel = nuke.createNode("ColorWheel")\nwheel["channels"].setValue("rgba")\nwheel["centerSaturation"].setValue(0.0)\nwheel["edgeSaturation"].setValue(1.0)\nwheel["centerValue"].setValue(1.0)\nwheel["edgeValue"].setValue(1.0)\nwheel["gamma"].setValue(1.0)\nwheel["rotate"].setValue(30.0)\nwheel["fillFormat"].setValue(True)' },
    argumentOverrides: { format: { examplesHtml: '<span class="source-note">Format object</span>' } }
  },
  CheckerBoard2: {
    tier: "verified", label: "Nuke-tested · 9 writable arguments passed · format control inspected", hideDescription: true,
    overview: "CheckerBoard creates a configurable tiled pattern used as a texture placeholder, distortion reference, or transparent-area backdrop.",
    synopsisArguments: ["boxsize", "color0", "color1", "linewidth", "linecolor", "format"],
    example: { title: "Create a neutral checkerboard reference", code: '# Generate a clean gray checkerboard using the project format.\nchecker = nuke.createNode("CheckerBoard2")\nchecker["boxsize"].setValue([64.0, 64.0])\nchecker["color0"].setValue([0.15, 0.15, 0.15, 1.0])\nchecker["color1"].setValue([0.35, 0.35, 0.35, 1.0])\nchecker["color2"].setValue([0.15, 0.15, 0.15, 1.0])\nchecker["color3"].setValue([0.35, 0.35, 0.35, 1.0])\nchecker["linewidth"].setValue([0.0, 0.0])' },
    argumentOverrides: { format: { examplesHtml: '<span class="source-note">Format object</span>' } }
  },
  Radial: {
    tier: "verified", label: "Nuke-tested · 16/16 arguments passed", hideDescription: true,
    overview: "Radial generates an elliptical matte or color ramp with adjustable bounds, softness, opacity, inversion, and output channels.",
    synopsisArguments: ["area", "softness", "color", "opacity", "output", "ramp", "invert", "replace"],
    example: { title: "Create a soft elliptical vignette matte", code: '# Generate a soft, inverted alpha vignette.\nradial = nuke.createNode("Radial")\nradial["area"].setValue([480.0, 270.0, 1440.0, 810.0])\nradial["output"].setValue("alpha")\nradial["softness"].setValue(0.6)\nradial["opacity"].setValue(1.0)\nradial["invert"].setValue(True)\nradial["replace"].setValue(True)' }
  },
  Ramp: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Ramp generates a linear, smooth, or eased gradient between two points and can draw into selected output channels.",
    synopsisArguments: ["p0", "p1", "type", "color", "opacity", "output", "invert", "replace"],
    example: { title: "Create a horizontal alpha gradient", code: '# Generate a left-to-right alpha ramp across an HD frame.\nramp = nuke.createNode("Ramp")\nramp["p0"].setValue([0.0, 540.0])\nramp["p1"].setValue([1920.0, 540.0])\nramp["type"].setValue("linear")\nramp["output"].setValue("alpha")\nramp["color"].setValue([1.0, 1.0, 1.0, 1.0])\nramp["replace"].setValue(True)' }
  },
  Position: {
    tier: "verified", label: "Nuke-tested · 1/1 argument passed", hideDescription: true,
    overview: "Position moves an image by whole pixels and repeats edge pixels into newly exposed areas. Use Transform when subpixel filtering, rotation, or scale is needed.",
    synopsisArguments: ["translate"],
    example: { title: "Offset an element by whole pixels", code: '# Move a generated element 120 pixels right and 40 pixels down.\nsource = nuke.createNode("ColorWheel")\nposition = nuke.createNode("Position")\nposition.setInput(0, source)\nposition["translate"].setValue([120.0, -40.0])' }
  },
  Mirror2: {
    tier: "verified", label: "Nuke-tested · 2/2 arguments passed", hideDescription: true,
    overview: "Mirror flips an image vertically, horizontally, or on both axes around the center of its format.",
    synopsisArguments: ["flop", "flip"],
    example: { title: "Create a horizontally mirrored variation", code: '# Mirror a generated test image from left to right.\nsource = nuke.createNode("ColorBars")\nmirror = nuke.createNode("Mirror2")\nmirror.setInput(0, source)\nmirror["flop"].setValue(True)\nmirror["flip"].setValue(False)' }
  },
  Tile: {
    tier: "verified", label: "Nuke-tested · 5/5 arguments passed", hideDescription: true,
    overview: "Tile scales and repeats an input across a fixed number of rows and columns, with optional alternating mirrored copies.",
    synopsisArguments: ["rows", "columns", "mirrorRows", "mirrorCols", "filter"],
    example: { title: "Build a seamless mirrored texture preview", code: '# Repeat a checkerboard in a mirrored 3x4 layout.\nsource = nuke.createNode("CheckerBoard2")\ntile = nuke.createNode("Tile")\ntile.setInput(0, source)\ntile["rows"].setValue(3.0)\ntile["columns"].setValue(4.0)\ntile["mirrorRows"].setValue(True)\ntile["mirrorCols"].setValue(True)\ntile["filter"].setValue("cubic")' }
  },
  Rectangle: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Rectangle draws a solid or softly feathered rectangular region into selected channels, either over an input or as a standalone generated element.",
    synopsisArguments: ["area", "softness", "color", "opacity", "output", "replace", "invert"],
    example: { title: "Create a soft rectangular garbage matte", code: '# Draw a feathered white rectangle into alpha.\nrectangle = nuke.createNode("Rectangle")\nrectangle["area"].setValue([400.0, 250.0, 1520.0, 830.0])\nrectangle["softness"].setValue([20.0, 20.0])\nrectangle["output"].setValue("alpha")\nrectangle["color"].setValue([1.0, 1.0, 1.0, 1.0])\nrectangle["replace"].setValue(True)' }
  },
  Soften: {
    tier: "verified", label: "Nuke-tested · 15/15 arguments passed", hideDescription: true,
    overview: "Soften uses a Laplacian operation and a selectable smoothing filter to reduce harsh local detail in chosen channels.",
    synopsisArguments: ["amount", "size", "minimum", "maximum", "filter", "quality", "channels", "mix"],
    example: { title: "Reduce harsh texture without a broad blur", code: '# Apply a restrained RGB softening pass to a test image.\nsource = nuke.createNode("ColorBars")\nsoften = nuke.createNode("Soften")\nsoften.setInput(0, source)\nsoften["channels"].setValue("rgb")\nsoften["amount"].setValue(0.35)\nsoften["size"].setValue(2.0)\nsoften["filter"].setValue("gaussian")\nsoften["quality"].setValue(15.0)\nsoften["mix"].setValue(0.8)' }
  },
  Median: {
    tier: "verified", label: "Nuke-tested · 10/10 arguments passed", hideDescription: true,
    overview: "Median replaces each pixel with the median of neighboring samples, making it useful for reducing isolated noise and small specks while retaining stronger edges.",
    synopsisArguments: ["size", "channels", "mix"],
    example: { title: "Reduce isolated color noise", code: '# Apply a small median filter to a generated test image.\nsource = nuke.createNode("ColorBars")\nmedian = nuke.createNode("Median")\nmedian.setInput(0, source)\nmedian["channels"].setValue("rgb")\nmedian["size"].setValue([2.0, 2.0])\nmedian["mix"].setValue(0.75)' }
  },
  Dither: {
    tier: "verified", label: "Nuke-tested · 14/14 arguments passed", hideDescription: true,
    overview: "Dither adds low-level noise to selected channels to reduce visible banding when values are quantized or displayed at limited precision.",
    synopsisArguments: ["amount", "channels", "monodither", "seed", "static_seed", "mix"],
    example: { title: "Break up banding in a smooth gradient", code: '# Create a gradient and add subtle monochrome dither.\nsource = nuke.createNode("Ramp")\ndither = nuke.createNode("Dither")\ndither.setInput(0, source)\ndither["channels"].setValue("rgb")\ndither["amount"].setValue(0.01)\ndither["monodither"].setValue(True)\ndither["static_seed"].setValue(True)' }
  },
  Glow2: {
    tier: "verified", label: "Nuke-tested · 19/19 arguments passed", hideDescription: true,
    overview: "Glow isolates brighter values, blurs them, and adds the result back to create a controllable luminous bloom.",
    synopsisArguments: ["tolerance", "size", "brightness", "saturation", "tint", "channels", "mix"],
    example: { title: "Add restrained highlight bloom", code: '# Add a soft glow to the bright regions of a test image.\nsource = nuke.createNode("ColorWheel")\nglow = nuke.createNode("Glow2")\nglow.setInput(0, source)\nglow["channels"].setValue("rgb")\nglow["tolerance"].setValue(0.6)\nglow["size"].setValue([20.0, 20.0])\nglow["brightness"].setValue(0.8)\nglow["saturation"].setValue(0.9)\nglow["mix"].setValue(0.75)' }
  },
  Emboss: {
    tier: "verified", label: "Nuke-tested · 20/20 arguments passed", hideDescription: true,
    overview: "Emboss derives directional edge relief from selected channels and can output a traditional embossed image or a utility edge result.",
    synopsisArguments: ["Angle", "Width", "edgedetector", "edgechannels", "optype", "output", "mix"],
    example: { title: "Generate a directional embossed edge pass", code: '# Create a test image and derive a directional alpha relief.\nsource = nuke.createNode("ColorWheel")\nemboss = nuke.createNode("Emboss")\nemboss.setInput(0, source)\nemboss["channels"].setValue("rgb")\nemboss["Angle"].setValue(45.0)\nemboss["Width"].setValue(2.0)\nemboss["edgedetector"].setValue("sobel")\nemboss["output"].setValue("alpha")' }
  },
  FilterErode: {
    tier: "verified", label: "Nuke-tested · 10/10 arguments passed", hideDescription: true,
    overview: "FilterErode grows or shrinks selected channels using a selectable reconstruction filter, offering smoother matte edges than a fast morphological operation.",
    synopsisArguments: ["size", "filter", "channels", "mix"],
    example: { title: "Contract a matte with a smooth filter", code: '# Generate a matte and contract it with a filtered edge.\nmatte = nuke.createNode("Radial")\nerode = nuke.createNode("FilterErode")\nerode.setInput(0, matte)\nerode["channels"].setValue("alpha")\nerode["size"].setValue([-2.0, -2.0])\nerode["filter"].setValue("gaussian")' }
  },
  ChannelMerge: {
    tier: "verified", label: "Nuke-tested · 12/12 arguments passed", hideDescription: true,
    overview: "ChannelMerge combines one channel from input A with one from input B and writes the result into a chosen output channel, leaving other B channels unchanged.",
    synopsisArguments: ["A", "B", "operation", "output", "bbox", "mix"],
    example: { title: "Union two generated alpha mattes", code: '# Combine two mattes and write their union into alpha.\na = nuke.createNode("Radial")\nb = nuke.createNode("Rectangle")\nmerge = nuke.createNode("ChannelMerge")\nmerge.setInput(0, a)\nmerge.setInput(1, b)\nmerge["A"].setValue("alpha")\nmerge["B"].setValue("alpha")\nmerge["operation"].setValue("union")\nmerge["output"].setValue("alpha")' }
  },
  Difference: {
    tier: "verified", label: "Nuke-tested · 3/3 arguments passed", hideDescription: true,
    overview: "Difference compares a clean plate in A with a subject plate in B and produces their difference as a rough matte.",
    synopsisArguments: ["offset", "gain", "output"],
    example: { title: "Generate a rough difference matte", code: '# Compare a clean plate with a changed plate.\nclean = nuke.createNode("CheckerBoard2")\nsubject = nuke.createNode("ColorWheel")\ndifference = nuke.createNode("Difference")\ndifference.setInput(0, clean)\ndifference.setInput(1, subject)\ndifference["offset"].setValue(0.02)\ndifference["gain"].setValue(2.0)\ndifference["output"].setValue("alpha")' }
  },
  CopyRectangle: {
    tier: "verified", label: "Nuke-tested · 4/4 arguments passed", hideDescription: true,
    overview: "CopyRectangle copies selected channels from a rectangular region of input A over input B, with optional feathering and mix control.",
    synopsisArguments: ["area", "softness", "channels", "mix"],
    example: { title: "Patch a rectangular region from another input", code: '# Copy a softly feathered region from A onto B.\npatch = nuke.createNode("ColorWheel")\nbase = nuke.createNode("CheckerBoard2")\ncopy = nuke.createNode("CopyRectangle")\ncopy.setInput(0, patch)\ncopy.setInput(1, base)\ncopy["area"].setValue([500.0, 300.0, 1420.0, 780.0])\ncopy["softness"].setValue([20.0, 20.0])\ncopy["channels"].setValue("rgba")' }
  },
  ClipTest: {
    tier: "verified", label: "Nuke-tested · 12/12 arguments passed", hideDescription: true,
    overview: "ClipTest overlays warnings on values below a lower limit or above an upper limit, helping identify clipped, negative, or super-white pixels.",
    synopsisArguments: ["lower", "upper", "channels", "mix"],
    example: { title: "Flag values outside the legal 0–1 range", code: '# Check a generated image for negative and super-white values.\nsource = nuke.createNode("ColorWheel")\ntest = nuke.createNode("ClipTest")\ntest.setInput(0, source)\ntest["channels"].setValue("rgb")\ntest["lower"].setValue(0.0)\ntest["upper"].setValue(1.0)' }
  },
  Blend: {
    tier: "verified", label: "Nuke-tested · 20/20 arguments passed", hideDescription: true,
    overview: "Blend creates a weighted average of multiple inputs, optionally normalizing their weights so the combined contribution remains balanced.",
    synopsisArguments: ["channels", "normalize", "weight0", "weight1"],
    example: { title: "Average three generated inputs", code: '# Blend three test images with normalized weights.\na = nuke.createNode("ColorBars")\nb = nuke.createNode("ColorWheel")\nc = nuke.createNode("CheckerBoard2")\nblend = nuke.createNode("Blend")\nblend.setInput(0, a)\nblend.setInput(1, b)\nblend.setInput(2, c)\nblend["channels"].setValue("rgba")\nblend["normalize"].setValue(True)\nblend["weight0"].setValue(1.0)\nblend["weight1"].setValue(1.0)\nblend["weight2"].setValue(1.0)' }
  }
};

function contentQualityCurrentNode() {
  return new URL(window.location.href).searchParams.get("node");
}

function applyContentQuality() {
  const page = document.querySelector("#page");
  if (!page) return;

    const nodeClass = contentQualityCurrentNode();
    const entry = CONTENT_QUALITY[nodeClass];

    page.querySelectorAll(".editorial-quality, .editorial-overview, .editorial-note").forEach(el => el.remove());
    if (!entry || !page.querySelector("h1")) return;

    const classLine = page.querySelector(".class-line");
    if (classLine) {
      const status = document.createElement("div");
      status.className = `editorial-quality editorial-quality-${entry.tier}`;
      status.textContent = entry.label;
      classLine.insertAdjacentElement("afterend", status);
    }

    const description = page.querySelector(".description");
    if (description && entry.hideDescription) {
      description.remove();
    }
    if (description && entry.description) {
      description.textContent = entry.description;
    }
    if (description && entry.overview) {
      const overview = document.createElement("section");
      overview.className = "editorial-overview";
      overview.innerHTML = `<div class="editorial-overview-title">Overview</div><div>${entry.overview}</div>`;
      (description.isConnected ? description : classLine)?.insertAdjacentElement("afterend", overview);

      if (entry.note) {
        const note = document.createElement("div");
        note.className = "editorial-note";
        note.textContent = entry.note;
        overview.insertAdjacentElement("afterend", note);
      }
    }

    for (const [argName, override] of Object.entries(entry.argumentOverrides || {})) {
      const row = document.querySelector(`#arg-${CSS.escape(argName)}`);
      if (!row) continue;

      if (override.type) {
        const el = row.querySelector(".arg-type");
        if (el) el.textContent = override.type;
      }
      if (override.defaultValue !== undefined) {
        const el = row.querySelector(".arg-default");
        if (el) el.textContent = override.defaultValue;
      }
      if (override.examplesHtml) {
        const el = row.querySelector(".arg-examples");
        if (el) el.innerHTML = override.examplesHtml;
      }
      if (override.description) {
        const el = row.querySelector(".arg-desc");
        if (el) el.textContent = override.description;
      }
    }

    if (entry.example) {
      const examples = page.querySelector(".examples");
      if (examples) examples.innerHTML = `<div class="example-item"><div class="example-title">${escapeHtml(entry.example.title)}</div><pre class="code">${highlightPython(entry.example.code)}</pre></div>`;
    }

    if (entry.suppressExamples) {
      const examples = page.querySelector(".examples");
      if (examples) {
        examples.innerHTML = '<div class="no-examples">No manually verified Python example is published for this special control yet.</div>';
      }
    }

    const examples = page.querySelector(".examples");
    const examplesHeading = examples?.closest(".section")?.querySelector("h2");
    const exampleCount = examples?.querySelectorAll(".example-item").length || 0;
    if (examplesHeading) examplesHeading.textContent = exampleCount === 1 ? "Example" : "Examples";
}

function contentQualitySynopsisArguments(nodeClass, argumentOrder) {
  return CONTENT_QUALITY[nodeClass]?.synopsisArguments || argumentOrder;
}

function contentQualityExample(nodeClass) {
  const example = CONTENT_QUALITY[nodeClass]?.example;
  return example ? {title: example.title, code: example.code} : null;
}

function contentQualitySuppressExamples(nodeClass) {
  return Boolean(CONTENT_QUALITY[nodeClass]?.suppressExamples);
}
